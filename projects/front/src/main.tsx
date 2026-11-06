// Mantine styles first: the CSS modules imported by the components must come after them to override them
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import App from '@front/components/App'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
