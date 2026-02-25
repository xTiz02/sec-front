import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { AppRoutes } from './routes/AppRoute'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={7000}
      > */}
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
