export function Footer() {
  return (
    <footer className="mt-16 border-t border-base-300 bg-base-100/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-between text-sm">
        <div className="text-center md:text-left">© 2025 Goldenergy. Todos os direitos reservados.</div>
        <div className="text-center md:text-right">Para suporte ou sugestões, contacte: <a href="mailto:newenergy@goldenergy.pt" className="link link-primary">newenergy@goldenergy.pt</a></div>
      </div>
    </footer>
  );
}
