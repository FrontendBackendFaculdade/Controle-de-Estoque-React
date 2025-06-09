import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { firebaseConfig } from "../firebase.js";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

SplashScreen.preventAutoHideAsync();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialCommunityIcons.font,
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setError('');
        });
        return () => unsubscribe();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleAuthentication = async () => {
        setError('');
        try {
            if (user) {
                await signOut(auth);
            } else {
                if (isLogin) {
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    await createUserWithEmailAndPassword(auth, email, password);
                }
            }
        } catch (e) {
            setError(e.message);
        }
    };

    if (!appIsReady) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={styles.container} onLayout={onLayoutRootView}>
            {user ? (
                <PaginaAuthenticated handleAuthentication={handleAuthentication} />
            ) : (
                <PaginaAuth
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    isLogin={isLogin}
                    setIsLogin={setIsLogin}
                    handleAuthentication={handleAuthentication}
                    error={error}
                    showPassword={showPassword}
                    toggleShowPassword={toggleShowPassword}
                />
            )}
        </ScrollView>
    );
}

const PaginaAuthenticated = ({ handleAuthentication }) => {
    const router = useRouter();
    const [themeColor, setThemeColor] = useState('purple');
    const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

    const apps = [
        { name: 'Cadastro', icon: 'server-outline', route: 'Paginas/Cadastro' },
        { name: 'Estoque', icon: 'layers-outline', route: 'Paginas/Estoque' },
        { name: 'Vendas', icon: 'cart-outline', route: 'Paginas/Vendas' },
        { name: 'Consulta', icon: 'storefront-outline', route: 'Paginas/Consulta' },
        { name: 'Pagamento', icon: 'person-outline', route: 'Paginas/Pagamento' },
        { name: 'Dashboard', icon: 'analytics-outline', route: 'Paginas/Dashboard' },
    ];

    const themeOptions = [
      { name: 'Roxo (Padrão)', value: 'purple' },
      { name: 'Azul Clássico', value: '#2196F3' },
      { name: 'Verde Esmeralda', value: '#4CAF50' },
      { name: 'Laranja Vibrante', value: '#FF9800' },
      { name: 'Vermelho Intenso', value: '#F44336' },
    ];

    return (
        <View style={stylesHome.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSettingsModalVisible}
                onRequestClose={() => setSettingsModalVisible(false)}
            >
                <View style={settingsStyles.modalContainer}>
                    <View style={settingsStyles.modalContent}>
                        <Text style={settingsStyles.title}>Personalizar Cores</Text>
                        {themeOptions.map((color) => (
                            <TouchableOpacity
                                key={color.value}
                                style={[
                                    settingsStyles.colorOption,
                                    { borderColor: themeColor === color.value ? color.value : 'transparent' },
                                ]}
                                onPress={() => setThemeColor(color.value)}
                            >
                                <View style={[settingsStyles.colorSwatch, { backgroundColor: color.value }]} />
                                <Text style={settingsStyles.colorName}>{color.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={settingsStyles.backButton}
                            onPress={() => setSettingsModalVisible(false)}
                        >
                            <Text style={settingsStyles.backButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={stylesHome.header}>
                <Text style={stylesHome.headerText}>Bem Vindo!</Text>
            </View>
            <View style={stylesHome.gridContainer}>
                {apps.map((app) => (
                    <TouchableOpacity 
                        key={app.name} 
                        style={stylesHome.tile}
                        onPress={() => router.push(app.route)}
                    >
                        <View style={stylesHome.tileContent}>
                            <Ionicons name={app.icon} size={40} color={themeColor} />
                            <Text style={stylesHome.tileText}>{app.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity
                style={[stylesHome.gearButton, { backgroundColor: themeColor }]}
                onPress={() => setSettingsModalVisible(true)}
            >
                <Ionicons name="settings-sharp" size={30} color="white" />
            </TouchableOpacity>
            <View style={stylesHome.logoutButtonContainer}>
                <Button
                    color="#d9534f"
                    title="Sair"
                    onPress={handleAuthentication}
                />
            </View>
        </View>
    );
};

const PaginaAuth = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication, error, showPassword, toggleShowPassword }) => (
    <View style={styles.authContainer}>
        <Text style={styles.title}>{isLogin ? 'Login' : 'Cadastrar'}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
        <View style={styles.inputContainer}>
            <TextInput style={styles.inputField} value={password} onChangeText={setPassword} placeholder="Senha" secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.iconContainer}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#aaa" />
            </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
            <Button title={isLogin ? 'Entrar' : 'Inscrever-se'} onPress={handleAuthentication} color="#3498db" />
        </View>
        <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleText}>{isLogin ? 'Precisa de uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center' },
    authContainer: { width: '75%', maxWidth: 400, alignSelf: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
    buttonContainer: { marginVertical: 10 },
    bottomContainer: { marginTop: 20 },
    toggleText: { color: '#3498db', textAlign: 'center' },
    errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
    inputField: { flex: 1, padding: 0 },
    iconContainer: { paddingLeft: 10 },
});

const stylesHome = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0', padding: 10 },
    header: { padding: 10, marginBottom: 10 },
    headerText: { fontSize: 24, fontWeight: 'bold' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
    tile: { width: '45%', height: 150, backgroundColor: 'white', borderRadius: 10, marginBottom: 20, justifyContent: 'center', alignItems: 'center', borderColor: 'gray', borderWidth: 2, padding: 10 },
    tileContent: { justifyContent: 'center', alignItems: 'center' },
    tileText: { fontSize: 16, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
    gearButton: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
    logoutButtonContainer: { marginTop: 40, alignSelf: 'center', width: '80%' }
});

const settingsStyles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { width: '90%', backgroundColor: '#f9f9f9', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    colorOption: { flexDirection: 'row', alignItems: 'center', padding: 12, width: '100%', marginBottom: 10, borderRadius: 12, backgroundColor: 'white', borderWidth: 3 },
    colorSwatch: { width: 30, height: 30, borderRadius: 15, marginRight: 20, borderWidth: 1, borderColor: '#eee' },
    colorName: { fontSize: 18, fontWeight: '500' },
    backButton: { marginTop: 20, backgroundColor: '#6c757d', paddingVertical: 14, borderRadius: 12, width: '100%' },
    backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});