import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaBell, FaUser, FaUsers, FaPlus, FaExclamationCircle, FaTimes, FaRupeeSign } from 'react-icons/fa';

const ExpenseTracker = () => {
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitWith: []
  });

  useEffect(() => {
    if (friends.length === 0) {
      setFriends([{ id: 1, name: 'You', isCurrentUser: true }]);
    }
  }, [friends.length]);

  const calculateSettlements = useCallback(() => {
    const balances = {};
    friends.forEach(friend => { balances[friend.id] = 0; });
    expenses.forEach(expense => {
      const share = expense.amount / expense.splitWith.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitWith.forEach(id => { balances[id] -= share; });
    });

    const newSettlements = [], debtors = [], creditors = [];
    Object.entries(balances).forEach(([id, balance]) => {
      const person = friends.find(f => f.id === parseInt(id));
      if (!person) return;
      if (balance > 0.01) creditors.push({ person, amount: balance });
      else if (balance < -0.01) debtors.push({ person, amount: -balance });
    });

    debtors.forEach(debtor => {
      creditors.forEach(creditor => {
        if (debtor.amount > 0 && creditor.amount > 0) {
          const settleAmount = Math.min(debtor.amount, creditor.amount);
          newSettlements.push({
            id: `${debtor.person.id}-${creditor.person.id}-${Date.now()}`,
            from: debtor.person,
            to: creditor.person,
            amount: settleAmount,
            status: 'pending',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          });
          debtor.amount -= settleAmount;
          creditor.amount -= settleAmount;
        }
      });
    });

    setSettlements(newSettlements);
  }, [friends, expenses]);

  useEffect(() => {
    calculateSettlements();
  }, [calculateSettlements]);

  const addFriend = () => {
    if (newFriendName.trim()) {
      const newFriend = {
        id: Date.now(),
        name: newFriendName.trim(),
        isCurrentUser: false
      };
      setFriends([...friends, newFriend]);
      setNewFriendName('');
      setShowAddFriend(false);
    }
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy && newExpense.splitWith.length > 0) {
      const expense = {
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        paidBy: parseInt(newExpense.paidBy),
        splitWith: newExpense.splitWith.map(id => parseInt(id)),
        date: new Date().toISOString(),
        settled: false
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ description: '', amount: '', paidBy: '', splitWith: [] });
      setShowAddExpense(false);
      addNotification(`New expense added: ${expense.description} - ₹${expense.amount}`);
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markSettlementPaid = (id) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
    addNotification('Payment confirmed!', 'success');
  };

  const sendReminder = (settlement) => {
    addNotification(`Reminder sent to ${settlement.from.name} for ₹${settlement.amount.toFixed(2)}`, 'warning');
  };

  const toggleSplitWith = (id) => {
    setNewExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(id)
        ? prev.splitWith.filter(x => x !== id)
        : [...prev.splitWith, id]
    }));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#334155'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '32px',
      textAlign: 'center'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid #e2e8f0',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '8px 8px 0 0',
      fontSize: '16px',
      fontWeight: '500',
      color: '#64748b',
      transition: 'all 0.2s ease',
      marginBottom: '-2px'
    },
    activeTab: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderBottom: '2px solid #3b82f6'
    },
    btn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      backgroundColor: '#3b82f6',
      color: 'white',
      minHeight: '44px'
    },
    btnSecondary: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    btnDanger: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    btnSuccess: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    modal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    checkboxContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px'
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      borderRadius: '6px',
      backgroundColor: '#f8fafc'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    },
    expenseCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    expenseTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    expenseAmount: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#059669',
      marginBottom: '12px'
    },
    expenseDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      color: '#64748b',
      fontSize: '14px'
    },
    settlementCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    settlementInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '500'
    },
    settlementActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    notificationCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px'
    },
    notificationContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      flex: 1
    },
    notificationText: {
      fontSize: '14px',
      lineHeight: '1.5'
    },
    badge: {
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginLeft: '8px'
    },
    emptyState: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: '16px',
      padding: '40px 20px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        <FaRupeeSign style={{ color: '#059669' }} />
        Group Expense Tracker
      </h1>
      
      <div style={styles.actionButtons}>
        <button 
          style={styles.btn} 
          onClick={() => setShowAddFriend(true)}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <FaUsers size={16} /> Add Friend
        </button>
        <button 
          style={styles.btn} 
          onClick={() => setShowAddExpense(true)}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <FaPlus size={16} /> Add Expense
        </button>
      </div>

      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'expenses' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'settlements' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('settlements')}
        >
          Settlements
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'notifications' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
        </button>
      </div>

      <div>
        {activeTab === 'expenses' && (
          <div>
            {expenses.length === 0 ? (
              <div style={styles.emptyState}>
                <FaRupeeSign size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                <p>No expenses yet. Add your first expense to get started!</p>
              </div>
            ) : (
              expenses.map(e => (
                <div key={e.id} style={styles.expenseCard}>
                  <div style={styles.expenseTitle}>{e.description}</div>
                  <div style={styles.expenseAmount}>₹{e.amount.toFixed(2)}</div>
                  <div style={styles.expenseDetails}>
                    <div><strong>Paid by:</strong> {friends.find(f => f.id === e.paidBy)?.name}</div>
                    <div><strong>Split with:</strong> {e.splitWith.map(id => friends.find(f => f.id === id)?.name).join(', ')}</div>
                    <div><strong>Date:</strong> {new Date(e.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settlements' && (
          <div>
            {settlements.length === 0 ? (
              <div style={styles.emptyState}>
                <FaCheck size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
                <p>All settled up! No pending payments.</p>
              </div>
            ) : (
              settlements.map(s => (
                <div key={s.id} style={styles.settlementCard}>
                  <div style={styles.settlementInfo}>
                    <FaUser style={{ color: '#6b7280' }} />
                    <span>{s.from.name}</span>
                    <span style={{ color: '#6b7280' }}>owes</span>
                    <FaUser style={{ color: '#6b7280' }} />
                    <span>{s.to.name}</span>
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>₹{s.amount.toFixed(2)}</span>
                    <span style={{ 
                      color: s.status === 'completed' ? '#059669' : '#f59e0b',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      ({s.status})
                    </span>
                  </div>
                  {s.status === 'pending' && (
                    <div style={styles.settlementActions}>
                      <button 
                        style={{ ...styles.btn, ...styles.btnSuccess }}
                        onClick={() => markSettlementPaid(s.id)}
                      >
                        <FaCheck /> Mark Paid
                      </button>
                      <button 
                        style={{ ...styles.btn, ...styles.btnSecondary }}
                        onClick={() => sendReminder(s)}
                      >
                        <FaBell /> Remind
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <FaBell size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  ...styles.notificationCard,
                  backgroundColor: !n.read ? '#f0f9ff' : 'white',
                  borderLeft: !n.read ? '4px solid #3b82f6' : 'none'
                }}>
                  <div style={styles.notificationContent}>
                    <div style={{ color: 
                      n.type === 'success' ? '#059669' : 
                      n.type === 'warning' ? '#f59e0b' : '#3b82f6' 
                    }}>
                      {n.type === 'success' && <FaCheck />}
                      {n.type === 'warning' && <FaExclamationCircle />}
                      {n.type === 'info' && <FaBell />}
                    </div>
                    <div>
                      <div style={styles.notificationText}>{n.message}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        {n.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {!n.read && (
                    <button 
                      style={{ ...styles.btn, padding: '8px 12px', fontSize: '12px' }}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <span>Add Friend</span>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '20px', 
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setShowAddFriend(false)}
              >
                <FaTimes />
              </button>
            </div>
            <input 
              style={styles.input}
              placeholder="Enter friend's name"
              value={newFriendName} 
              onChange={(e) => setNewFriendName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFriend()}
            />
            <div style={styles.modalActions}>
              <button 
                style={{ ...styles.btn, ...styles.btnSecondary }}
                onClick={() => setShowAddFriend(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.btn}
                onClick={addFriend}
                disabled={!newFriendName.trim()}
              >
                Add Friend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <span>Add Expense</span>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '20px', 
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setShowAddExpense(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <input 
              style={styles.input}
              placeholder="What was this expense for?"
              value={newExpense.description} 
              onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))} 
            />
            
            <input 
              style={styles.input}
              type="number" 
              placeholder="Amount (e.g., 250.50)"
              value={newExpense.amount} 
              onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} 
            />
            
            <select 
              style={styles.select}
              value={newExpense.paidBy} 
              onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
            >
              <option value="">Who paid for this?</option>
              {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                Split with:
              </label>
              <div style={styles.checkboxContainer}>
                {friends.map(f => (
                  <label key={f.id} style={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      style={styles.checkbox}
                      checked={newExpense.splitWith.includes(f.id)} 
                      onChange={() => toggleSplitWith(f.id)} 
                    />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button 
                style={{ ...styles.btn, ...styles.btnSecondary }}
                onClick={() => setShowAddExpense(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.btn}
                onClick={addExpense}
                disabled={!newExpense.description || !newExpense.amount || !newExpense.paidBy || newExpense.splitWith.length === 0}
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;