import AuthProvider from "./provider/authProvider.jsx";
import Routes from "./routes";

function App() {
    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    );
}

export default App;
