import React, { useState, useEffect } from 'react';
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
import {firebaseConfig} from "../firebase"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';



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
    const [email,
        setEmail] = useState('');
    const [password,
        setPassword] = useState('');
    const [user,
        setUser] = useState(null);
    const [isLogin,
        setIsLogin] = useState(true);
    const [error,
        setError] = useState('');

    const [showPassword, setShowPassword] = useState(true);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setError(''); // Clear error on auth state change
        });

        return () => toggleShowPassword(), unsubscribe();
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
                    error={error}/>)}
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

const PaginaAuthenticated = ({user, handleAuthentication}) => {
    const styles2 = ({
        container: {
          flex: 1,
          backgroundColor: '#f0f0f0',
          padding: 10,
        },
        header: {
          padding: 10,
          marginBottom:10,
          
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
          justifyContent:'flex-start',
          alignItems:'center',
          borderColor: 'gray',
          borderWidth: 2,
        },
        tileContent: {
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width:'100%',
          height:'100%',
        },
        tileText: {
          fontSize: 18,
          fontWeight: 'bold',
          marginTop: 10,
        },
        gearButton: {
          bottom: 20,
          left: 0,
          right: 0,
          marginTop: 35,
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: '#2196F3',
          width: 60,
          height: 60,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
        },
        triangle: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderRightWidth: 40,
          borderTopWidth: 40,
          borderRightColor: 'transparent',
          borderTopColor: '#2196F3',
        },
      });
      const apps = [
        { name: 'Cadastro', icon: 'server-outline' },
        { name: 'Estoque', icon: 'layers-outline' },
        { name: 'Vendas', icon: 'cart-outline' },
        { name: 'Consulta', icon: 'storefront-outline' },
        { name: 'Pagamento', icon: 'person-outline' },
        { name: 'Dashboard', icon: 'analytics-outline' },
      ];
    
    return (
            <View style={styles2.container}>
              <View style={styles2.header}>
                <Text style={styles2.headerText}>Bem Vindo!</Text>
              </View>
              <View style={styles2.gridContainer}>
                {apps.map((app, index) => (
                  <TouchableOpacity key={index} style={styles2.tile}>
                    <View style={styles2.tileContent}>
                      <Ionicons name={app.icon} size={24} color="gray" />
                      <Text style={styles2.tileText}>{app.name}</Text>
                    </View>
                     <View style={styles2.triangle} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles2.gearButton}>
                <Ionicons name="settings-sharp" size={30} color="white" />
              </TouchableOpacity>
              <Button 
                BackgroundColor="#000000"
                title="Sair"
                onPress={handleAuthentication}/>
            </View>
          );
        };