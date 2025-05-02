const Footer = () => {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Countries Explorer | All rights reserved
        </p>
        <p className="text-xs mt-2 text-neutral-500 dark:text-neutral-400">
          Data provided by REST Countries API
        </p>
      </div>
    </footer>
  )
}

export default Footer