import React from 'react';
import { View, Text, TextInput, Button, StyleSheet,TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";

const CadastroCliente = () => {
    const router = useRouter();
    const [nome, setNome] = React.useState('');
    const [cpf, setCpf] = React.useState('');
    const [email, setEmail] = React.useState('');

    const handleSalvar = () => {
        if (!nome || !cpf || !email) {
            alert('Preencha todos os campos!');
            return;
        }
        alert('Cliente cadastrado!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Cadastro de Cliente</Text>
            <TextInput
                placeholder="Nome completo"
                style={styles.input}
                value={nome}
                onChangeText={setNome}
            />
            <TextInput
                placeholder="CPF"
                style={styles.input}
                keyboardType="numeric"
                value={cpf}
                onChangeText={setCpf}
            />
            <TextInput
                placeholder="E-mail"
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <Button title="Salvar" onPress={handleSalvar} />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>Voltar</Text>
                        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    backButton: {
        backgroundColor: '#555',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5
    }
});

export default CadastroCliente;
