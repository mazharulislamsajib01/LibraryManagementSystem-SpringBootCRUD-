
import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8080/api'

async function api(url, options = {}) {
  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const emptyBook = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  totalCopies: 1,
  availableCopies: 1,
}

const emptyMember = {
  name: '',
  email: '',
  phone: '',
  address: '',
  membershipDate: new Date().toISOString().slice(0, 10),
}

function App() {
  const [page, setPage] = useState('Dashboard')
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [loans, setLoans] = useState([])
  const [bookForm, setBookForm] = useState(emptyBook)
  const [memberForm, setMemberForm] = useState(emptyMember)
  const [editingBook, setEditingBook] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [memberId, setMemberId] = useState('')
  const [bookId, setBookId] = useState('')
  const [bookSearch, setBookSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadBooks(keyword = '') {
    const data = keyword.trim()
        ? await api(`/books/search?keyword=${encodeURIComponent(keyword.trim())}`)
        : await api('/books/get')
    setBooks(data || [])
  }

  async function loadMembers(keyword = '') {
    const data = keyword.trim()
        ? await api(`/members/search?keyword=${encodeURIComponent(keyword.trim())}`)
        : await api('/members/get')
    setMembers(data || [])
  }

  async function loadLoans() {
    const data = await api('/loans/get')
    setLoans(data || [])
  }

  async function loadAll() {
    setError('')
    try {
      await Promise.all([loadBooks(), loadMembers(), loadLoans()])
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function notifyError(err) {
    setError(err.message || 'Something went wrong.')
    setMessage('')
  }

  function notifySuccess(text) {
    setMessage(text)
    setError('')
  }

  async function handleBookSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const data = {
      ...bookForm,
      totalCopies: Number(bookForm.totalCopies),
      availableCopies: Number(bookForm.availableCopies),
    }

    try {
      if (editingBook !== null) {
        await api(`/books/${editingBook}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
        notifySuccess('Book updated successfully.')
      } else {
        await api('/books/post', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        notifySuccess('Book added successfully.')
      }

      setBookForm(emptyBook)
      setEditingBook(null)
      await loadBooks(bookSearch)
    } catch (err) {
      notifyError(err)
    }
  }

  function startBookEdit(book) {
    setEditingBook(book.id)
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    })
    setPage('Books')
    setMessage('')
    setError('')
  }

  async function deleteBook(id) {
    if (!window.confirm('Are you sure you want to delete this book?')) return

    try {
      await api(`/books/${id}`, { method: 'DELETE' })
      notifySuccess('Book deleted successfully.')
      await loadBooks(bookSearch)
    } catch (err) {
      notifyError(err)
    }
  }

  async function handleMemberSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      if (editingMember !== null) {
        await api(`/members/${editingMember}`, {
          method: 'PUT',
          body: JSON.stringify(memberForm),
        })
        notifySuccess('Member updated successfully.')
      } else {
        await api('/members/post', {
          method: 'POST',
          body: JSON.stringify(memberForm),
        })
        notifySuccess('Member registered successfully.')
      }

      setMemberForm(emptyMember)
      setEditingMember(null)
      await loadMembers(memberSearch)
    } catch (err) {
      notifyError(err)
    }
  }

  function startMemberEdit(member) {
    setEditingMember(member.id)
    setMemberForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      membershipDate: member.membershipDate || '',
    })
    setPage('Members')
    setError('')
    setMessage('')
  }

  async function deleteMember(id) {
    if (!window.confirm('Are you sure you want to delete this member?')) return

    try {
      await api(`/members/${id}`, { method: 'DELETE' })
      notifySuccess('Member deleted successfully.')
      await loadMembers(memberSearch)
    } catch (err) {
      notifyError(err)
    }
  }

  async function issueBook(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await api(
          `/loans/issue?memberId=${memberId}&bookId=${bookId}`,
          { method: 'POST' }
      )
      notifySuccess('Book issued successfully. Loan period: 14 days.')
      setBookId('')
      await loadAll()
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }

  async function returnBook(id) {
    if (!window.confirm('Confirm book return?')) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await api(`/loans/${id}/return`, { method: 'POST' })
      notifySuccess('Book returned successfully.')
      await loadAll()
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }

  const issuedLoans = loans.filter(loan => loan.status === 'ISSUED')
  const availableCopies = books.reduce(
      (total, book) => total + (Number(book.availableCopies) || 0),
      0
  )

  const navigation = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Books', icon: '▤' },
    { name: 'Members', icon: '♙' },
    { name: 'Issue & Return', icon: '⇄' },
    { name: 'Loan History', icon: '◷' },
  ]

  function renderDashboard() {
    return (
        <>
          <div className="stats-grid">
            <Stat title="Book Titles" value={books.length} icon="▤" color="blue" />
            <Stat title="Members" value={members.length} icon="♙" color="purple" />
            <Stat title="Currently Issued" value={issuedLoans.length} icon="⇄" color="orange" />
            <Stat title="Available Copies" value={availableCopies} icon="✓" color="green" />
          </div>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Book Collection</h2>
                <p>Books loaded from your PostgreSQL database</p>
              </div>
              <button className="btn primary" onClick={() => setPage('Books')}>
                Manage Books
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Available</th>
                </tr>
                </thead>
                <tbody>
                {books.slice(0, 5).map(book => (
                    <tr key={book.id}>
                      <td><strong>{book.title}</strong><small>ISBN: {book.isbn}</small></td>
                      <td>{book.author}</td>
                      <td><span className="category-tag">{book.category}</span></td>
                      <td>{book.availableCopies} / {book.totalCopies}</td>
                    </tr>
                ))}
                {books.length === 0 && (
                    <tr><td colSpan="4">No books found.</td></tr>
                )}
                </tbody>
              </table>
            </div>
          </section>
        </>
    )
  }

  function renderBooks() {
    return (
        <>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{editingBook !== null ? 'Edit Book' : 'Add New Book'}</h2>
                <p>Enter book details</p>
              </div>
            </div>

            <form className="form-grid" onSubmit={handleBookSubmit}>
              <Field label="Book Title">
                <input required value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
              </Field>
              <Field label="Author">
                <input required value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
              </Field>
              <Field label="ISBN">
                <input required value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} />
              </Field>
              <Field label="Category">
                <input required value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} />
              </Field>
              <Field label="Total Copies">
                <input type="number" min="1" required value={bookForm.totalCopies} onChange={e => setBookForm({ ...bookForm, totalCopies: e.target.value })} />
              </Field>
              <Field label="Available Copies">
                <input type="number" min="0" required value={bookForm.availableCopies} onChange={e => setBookForm({ ...bookForm, availableCopies: e.target.value })} />
              </Field>
              <div className="form-actions">
                <button className="btn primary">{editingBook !== null ? 'Save Changes' : '+ Add Book'}</button>
                {editingBook !== null && (
                    <button type="button" className="btn secondary" onClick={() => {
                      setEditingBook(null)
                      setBookForm(emptyBook)
                    }}>Cancel</button>
                )}
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div><h2>All Books</h2><p>{books.length} book titles</p></div>
              <form className="search-form" onSubmit={async e => {
                e.preventDefault()
                try { await loadBooks(bookSearch) } catch (err) { notifyError(err) }
              }}>
                <input placeholder="Search books..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
                <button className="btn primary">Search</button>
                <button type="button" className="btn secondary" onClick={async () => {
                  setBookSearch('')
                  try { await loadBooks('') } catch (err) { notifyError(err) }
                }}>Reset</button>
              </form>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title / ISBN</th><th>Author</th><th>Category</th><th>Copies</th><th>Actions</th></tr></thead>
                <tbody>
                {books.map(book => (
                    <tr key={book.id}>
                      <td><strong>{book.title}</strong><small>ISBN: {book.isbn}</small></td>
                      <td>{book.author}</td>
                      <td><span className="category-tag">{book.category}</span></td>
                      <td>{book.availableCopies} / {book.totalCopies}</td>
                      <td><div className="action-group">
                        <button className="btn small secondary" onClick={() => startBookEdit(book)}>Edit</button>
                        <button className="btn small danger" onClick={() => deleteBook(book.id)}>Delete</button>
                      </div></td>
                    </tr>
                ))}
                {books.length === 0 && <tr><td colSpan="5">No books found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
    )
  }

  function renderMembers() {
    return (
        <>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{editingMember !== null ? 'Edit Member' : 'Register Member'}</h2>
                <p>Member details and contact information</p>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleMemberSubmit}>
              <Field label="Full Name">
                <input required value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" required value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input required value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} />
              </Field>
              <Field label="Address">
                <input required value={memberForm.address} onChange={e => setMemberForm({ ...memberForm, address: e.target.value })} />
              </Field>
              <Field label="Membership Date">
                <input type="date" required value={memberForm.membershipDate} onChange={e => setMemberForm({ ...memberForm, membershipDate: e.target.value })} />
              </Field>
              <div className="form-actions">
                <button className="btn primary">{editingMember !== null ? 'Save Changes' : '+ Register Member'}</button>
                {editingMember !== null && <button type="button" className="btn secondary" onClick={() => {
                  setEditingMember(null)
                  setMemberForm(emptyMember)
                }}>Cancel</button>}
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div><h2>All Members</h2><p>{members.length} registered members</p></div>
              <form className="search-form" onSubmit={async e => {
                e.preventDefault()
                try { await loadMembers(memberSearch) } catch (err) { notifyError(err) }
              }}>
                <input placeholder="Search members..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                <button className="btn primary">Search</button>
                <button type="button" className="btn secondary" onClick={async () => {
                  setMemberSearch('')
                  try { await loadMembers('') } catch (err) { notifyError(err) }
                }}>Reset</button>
              </form>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Member Since</th><th>Actions</th></tr></thead>
                <tbody>
                {members.map(member => (
                    <tr key={member.id}>
                      <td><strong>{member.name}</strong></td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>{member.membershipDate}</td>
                      <td><div className="action-group">
                        <button className="btn small secondary" onClick={() => startMemberEdit(member)}>Edit</button>
                        <button className="btn small danger" onClick={() => deleteMember(member.id)}>Delete</button>
                      </div></td>
                    </tr>
                ))}
                {members.length === 0 && <tr><td colSpan="5">No members found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
    )
  }

  function renderIssueReturn() {
    return (
        <section className="panel narrow-panel">
          <div className="panel-heading">
            <div><h2>Issue a Book</h2><p>Choose a member and an available book</p></div>
          </div>
          <form className="form-grid one-column" onSubmit={issueBook}>
            <Field label="Member">
              <select required value={memberId} onChange={e => setMemberId(e.target.value)}>
                <option value="">Select member</option>
                {members.map(member => <option key={member.id} value={member.id}>{member.name} (ID: {member.id})</option>)}
              </select>
            </Field>
            <Field label="Available Book">
              <select required value={bookId} onChange={e => setBookId(e.target.value)}>
                <option value="">Select book</option>
                {books.filter(book => Number(book.availableCopies) > 0).map(book => (
                    <option key={book.id} value={book.id}>{book.title} ({book.availableCopies} available)</option>
                ))}
              </select>
            </Field>
            <p className="form-hint">The backend sets the issue date and due date automatically (14 days).</p>
            <button className="btn primary" disabled={loading}>{loading ? 'Processing...' : 'Issue Book'}</button>
          </form>
        </section>
    )
  }

  function renderLoans() {
    const [unused] = [null]
    return (
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Loan History</h2><p>{loans.length} total loan records</p></div>
            <button className="btn secondary" onClick={() => loadAll()}>Refresh</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Loan ID</th><th>Member</th><th>Book</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
              {loans.map(loan => (
                  <tr key={loan.id}>
                    <td>#{loan.id}</td>
                    <td>{loan.member?.name || `Member #${loan.member?.id ?? ''}`}</td>
                    <td>{loan.book?.title || `Book #${loan.book?.id ?? ''}`}</td>
                    <td>{loan.issueDate}</td>
                    <td>{loan.dueDate}</td>
                    <td>{loan.returnDate || '—'}</td>
                    <td><span className={`status-tag ${loan.status === 'RETURNED' ? 'returned' : 'issued'}`}>{loan.status}</span></td>
                    <td>{loan.status === 'ISSUED'
                        ? <button className="btn small primary" disabled={loading} onClick={() => returnBook(loan.id)}>Return</button>
                        : '—'}</td>
                  </tr>
              ))}
              {loans.length === 0 && <tr><td colSpan="8">No loan records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
    )
  }

  const pageDescriptions = {
    Dashboard: 'Overview of your library',
    Books: 'Manage your book collection',
    Members: 'Manage registered members',
    'Issue & Return': 'Manage borrowing and returns',
    'Loan History': 'Track all borrowing records',
  }

  return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-icon">L</span>
            <div><h2>LibraryMS</h2><small>Management System</small></div>
          </div>
          <p className="nav-heading">MAIN MENU</p>
          <nav className="nav-menu">
            {navigation.map(item => (
                <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => {
                  setPage(item.name)
                  setError('')
                  setMessage('')
                }}>
                  <span>{item.icon}</span>{item.name}
                </button>
            ))}
          </nav>
          <div className="sidebar-footer"><span className="online-dot" /> Library Administration</div>
        </aside>

        <main className="main-content">
          <header className="page-header">
            <div>
              <p className="eyebrow">LIBRARY MANAGEMENT SYSTEM</p>
              <h1>{page}</h1>
              <p className="header-subtitle">{pageDescriptions[page]}</p>
            </div>
            <div className="admin-profile">
              <div className="avatar">A</div>
              <div><strong>Administrator</strong><small>Library Admin</small></div>
            </div>
          </header>

          <div className="content-area">
            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}

            {page === 'Dashboard' && renderDashboard()}
            {page === 'Books' && renderBooks()}
            {page === 'Members' && renderMembers()}
            {page === 'Issue & Return' && renderIssueReturn()}
            {page === 'Loan History' && renderLoans()}
          </div>

          <footer className="app-footer">LibraryMS · Library Management System</footer>
        </main>
      </div>
  )
}

function Stat({ title, value, icon, color }) {
  return (
      <div className="stat-card">
        <div><p>{title}</p><h2>{value}</h2></div>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
  )
}

function Field({ label, children }) {
  return <label className="field-label">{label}{children}</label>
}

export default App
