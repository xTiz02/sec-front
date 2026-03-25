import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { AppRoutes } from './routes/AppRoute'
import { Toaster } from './components/ui/sonner'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
