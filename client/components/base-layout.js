export default function BaseLayout({ children, currentUser }) {
  return (
    <div className="container">
      <Header currentUser={currentUser} />
      {children}
    </div>
  );
}
