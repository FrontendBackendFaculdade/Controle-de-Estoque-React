import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ScrollView,
    TouchableOpacity,
    StyleSheet, // Usar StyleSheet para melhor organização
    Image, // Importar Image para o componente animado
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

// --- Imports para Splash Screen e Animação ---
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// Impede que a splash screen nativa desapareça
SplashScreen.preventAutoHideAsync();

// --- COMPONENTE DA SPLASH SCREEN ANIMADA ---
// Este componente será exibido enquanto o app principal carrega
const AnimatedSplashScreen = () => {
    // Valores compartilhados para controlar a animação
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        // Inicia a animação quando o componente é montado
        opacity.value = withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) });
        scale.value = withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) });
    }, []);

    // Estilo que será aplicado ao componente animado
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
            <Animated.View style={animatedStyle}>
                {/* Certifique-se de que o caminho para sua imagem está correto */}
                <Image
                    source={require('../assets/splash.png')}
                    style={{ width: 250, height: 250, resizeMode: 'contain' }}
                />
            </Animated.View>
        </View>
    );
};


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
                // Carrega as fontes necessárias em segundo plano
                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialCommunityIcons.font,
                });

                // Simula um tempo de carregamento para que a animação seja visível
                await new Promise(resolve => setTimeout(resolve, 2500));

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
            // Esconde a splash screen nativa quando o app estiver pronto e renderizado
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    const handleAuthentication = async () => { /* ... sua lógica de autenticação ... */ };
    const toggleShowPassword = () => setShowPassword(!showPassword);

    // Renderiza o componente de splash animada enquanto o app não está pronto
    if (!appIsReady) {
        return <AnimatedSplashScreen />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container} onLayout={onLayoutRootView}>
            {user
                ? (<PaginaAuthenticated user={user} handleAuthentication={handleAuthentication}/>)
                : (<PaginaAuth
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    isLogin={isLogin}
                    setIsLogin={setIsLogin}
                    handleAuthentication={handleAuthentication}
                    error={error}
                    showPassword={showPassword}
                    toggleShowPassword={toggleShowPassword}/>)}
        </ScrollView>
    );
}

// (O restante do seu código, componentes e estilos permanecem os mesmos)

// --- ESTILOS (Convertido para StyleSheet para melhor performance) ---
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    // ... cole aqui o resto do seu objeto 'styles'
    authContainer: {
        width: '75%',
        maxWidth: 400,
        alignSelf: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5
    },
    buttonContainer: {
        marginVertical: 10
    },
    bottomContainer: {
        marginTop: 20
    },
    toggleText: {
        color: '#3498db',
        textAlign: 'center'
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center'
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    inputField: {
        flex: 1,
        padding: 0,
    },
    iconContainer: {
        paddingLeft: 10,
    },
});

const PaginaAuth = ({
    email,
    setEmail,
    password,
    setPassword,
    isLogin,
    setIsLogin,
    handleAuthentication,
    error,
    showPassword,
    toggleShowPassword
}) => {
    return (
        <View style={styles.authContainer}>
            <Text style={styles.title}>{isLogin ? 'Login' : 'Cadastrar'}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputField}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color="#aaa"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title={isLogin ? 'Entrar' : 'Inscrever-se'}
                    onPress={handleAuthentication}
                    color="#3498db"
                />
            </View>
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.toggleText}>
                        {isLogin
                            ? 'Precisa de uma conta? Cadastre-se'
                            : 'Já tem uma conta? Faça login'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const PaginaAuthenticated = ({handleAuthentication, navigation }) => { 
    
    const stylesHome = ({ 
        container: {
            flex: 1,
            backgroundColor: '#f0f0f0',
            padding: 10,
        },
        header: {
            padding: 10,
            marginBottom: 10,
        },
        headerText: {
            fontSize: 24,
            fontWeight: 'bold',
        },
        gridContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
        },
        tile: {
            width: '45%',
            height: 150,
            backgroundColor: 'white',
            borderRadius: 10,
            marginBottom: 20,
            justifyContent: 'flex-start', 
            alignItems: 'center',
            borderColor: 'gray',
            borderWidth: 2,
            padding: 10,
        },
        tileContent: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        },
        tileText: {
            fontSize: 16, // Ajustado para caber melhor
            fontWeight: 'bold',
            marginTop: 10,
            textAlign: 'center', // Para nomes de app mais longos
        },
        gearButton: {
            position: 'absolute', 
            bottom: 20,
            alignSelf: 'center', 
            backgroundColor: '#2196F3',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20, 
        },
        logoutButtonContainer: { 
            marginTop: 20,
            alignSelf: 'center',
            width: '80%',
        }
    });

    const router = useRouter();

    const apps = [
        { name: 'Cadastro', icon: 'server-outline', route: 'Paginas/Cadastro' }, 
        { name: 'Estoque', icon: 'layers-outline', route: 'Paginas/Estoque' },
        { name: 'Vendas', icon: 'cart-outline', route: 'Paginas/Vendas' },
        { name: 'Consulta', icon: 'storefront-outline', route: 'Paginas/Consulta' },
        { name: 'Pagamento', icon: 'person-outline', route: 'Paginas/Pagamento' },
        { name: 'Dashboard', icon: 'analytics-outline', route: 'Paginas/Dashboard' },
    ];

    const handleSettingsPress = () => {
        console.log("Botão de Configurações pressionado");
        router.navigate('Settings');
        };

    return (
        <View style={stylesHome.container}>
            <View style={stylesHome.header}>
                <Text style={stylesHome.headerText}>Bem Vindo !</Text>
            </View>
            <View style={stylesHome.gridContainer}>
                {apps.map((app) => (
                    <TouchableOpacity
                        key={app.route} 
                        style={stylesHome.tile}
                        onPress={() => router.navigate(app.route)}
                    >
                        <View style={stylesHome.tileContent}>
                            <Ionicons name={app.icon} size={40} color="purple" />
                            <Text style={stylesHome.tileText}>{app.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={stylesHome.gearButton} onPress={handleSettingsPress}>
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