import React, { useState, useEffect } from 'react'
import { dbHelpers } from '../../lib/supabase'
import { toast } from 'react-toastify'
import {
  Users as UsersIcon,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  UserPlus,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  Mail,
  AlertCircle,
  CheckCircle,
  Crown,
  User
} from 'lucide-react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [userStats, setUserStats] = useState({})
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [filterRole, setFilterRole] = useState('all')
  const usersPerPage = 10

  useEffect(() => {
    loadUsers()
    loadUserStats()
  }, [currentPage, searchTerm, filterRole])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error, count } = await dbHelpers.getAllUsers(currentPage, usersPerPage, searchTerm)
      
      if (error) {
        toast.error('Failed to load users')
        console.error('Error loading users:', error)
        return
      }

      // Filter by role if specified
      let filteredData = data || []
      if (filterRole !== 'all') {
        filteredData = filteredData.filter(user => user.role === filterRole)
      }

      setUsers(filteredData)
      setTotalUsers(count || 0)
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      const { data, error } = await dbHelpers.getUserStats()
      if (!error && data) {
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await dbHelpers.updateUserRole(userId, newRole)
      
      if (error) {
        toast.error('Failed to update user role')
        return
      }

      toast.success('User role updated successfully')
      loadUsers()
      loadUserStats()
    } catch (error) {
      toast.error('Failed to update user role')
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const { error } = await dbHelpers.deleteUser(userToDelete.id)
      
      if (error) {
        toast.error('Failed to delete user')
        return
      }

      toast.success('User deleted successfully')
      setShowDeleteModal(false)
      setUserToDelete(null)
      loadUsers()
      loadUserStats()
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Error deleting user:', error)
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first')
      return
    }

    // Implement bulk actions here
    toast.info(`Bulk ${action} action would be implemented here`)
  }

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Created At'],
      ...users.map(user => [
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.role,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(totalUsers / usersPerPage)

  const statCards = [
    {
      title: 'Total Users',
      value: userStats.total || 0,
      icon: UsersIcon,
      color: 'blue',
      change: `+${userStats.monthlySignups || 0} this month`
    },
    {
      title: 'Administrators',
      value: userStats.admins || 0,
      icon: Crown,
      color: 'purple',
      change: 'Admin accounts'
    },
    {
      title: 'Customers',
      value: userStats.customers || 0,
      icon: User,
      color: 'green',
      change: 'Customer accounts'
    },
    {
      title: 'New This Week',
      value: userStats.weeklySignups || 0,
      icon: UserPlus,
      color: 'orange',
      change: 'Weekly signups'
    }
  ]

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner large"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage user accounts, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <button onClick={exportUsers} className="btn btn-secondary">
            <Download size={18} />
            Export
          </button>
          <button onClick={loadUsers} className="btn btn-secondary">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <p className="stat-change">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="users-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-wrapper">
            <Filter size={20} className="filter-icon" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="customer">Customers</option>
            </select>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedUsers.length} selected</span>
            <button 
              onClick={() => handleBulkAction('delete')}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(user => user.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="user-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.first_name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="user-id">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-email">
                      <Mail size={16} />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`role-select ${user.role}`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td>
                    <div className="join-date">
                      <Calendar size={16} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">
                      <CheckCircle size={14} />
                      Active
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button className="action-btn view">
                        <Eye size={16} />
                      </button>
                      <button className="action-btn edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => {
                          setUserToDelete(user)
                          setShowDeleteModal(true)
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            <div className="pagination-info">
              Page {currentPage} of {totalPages} ({totalUsers} total users)
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3>
                <AlertCircle size={20} />
                Confirm Delete
              </h3>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete user <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone. All user data will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <UsersIcon size={64} />
          </div>
          <div className="empty-content">
            <h3>No Users Found</h3>
            <p>
              {searchTerm || filterRole !== 'all'
                ? 'No users match your current filters. Try adjusting your search or filter criteria.'
                : 'No users have been registered yet.'
              }
            </p>
            {(searchTerm || filterRole !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterRole('all')
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
