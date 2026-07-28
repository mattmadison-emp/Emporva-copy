import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import { Suspense } from "react";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/base/ErrorBoundary";


function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter basename={__BASE_PATH__}>
          <AuthProvider>
            <Suspense fallback={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: '#666'
              }}>
                Loading...
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

export default App;
