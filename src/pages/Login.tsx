export default function Login() {
  return (
    <div className="login-page">
      <h1>Sign In to TD in a Box</h1>
      <form>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Password" />
        </div>
        <button type="submit" className="btn btn-primary">
          Sign In
        </button>
      </form>
    </div>
  );
}
