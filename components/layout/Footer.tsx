export default function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Async Standup Analyzer
        </p>
      </div>
    </footer>
  );
}