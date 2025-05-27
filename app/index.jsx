import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ScrollView,
    TouchableOpacity,
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
import {firebaseConfig} from "../firebase.js";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const styles = {
    container: {
        flexGrow: 1,
        justifyContent: 'center'
    },
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
};

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setError('');
        });

        return () => unsubscribe();
    }, []);

    const handleAuthentication = async() => {
        setError(''); // Clear previous errors
        try {
            if (user) {
                await signOut(auth);
                console.log('Usuário deslogado com sucesso!');
            } else {
                if (isLogin) {
                    await signInWithEmailAndPassword(auth, email, password);
                    console.log('Usuário logado com sucesso!');
                } else {
                    await createUserWithEmailAndPassword(auth, email, password);
                    console.log('Usuário criado com sucesso!');
                }
            }
        } catch (error) {
            setError(error.message);
            console.error('Erro de autenticação:', error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
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