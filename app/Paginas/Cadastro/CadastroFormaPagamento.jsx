import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';

const CadastroPagamento = () => {
    const router = useRouter();
    const [nome, setNome] = React.useState('');
    const [ativo, setAtivo] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const verificarFormaExistente = async (nomeForma) => {
        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listformas');
            if (!response.ok) {
                console.warn('Não foi possível buscar formas de pagamento existentes para verificação.');
                return false;
            }
            const formasExistentes = await response.json();

            if (Array.isArray(formasExistentes)) {
                return formasExistentes.some(forma => forma.nome.toLowerCase() === nomeForma.toLowerCase());
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar forma existente:', error);
            return false;
        }
    };

    const handleSalvar = async () => {
        const nomeTrimmed = nome.trim();
        if (!nomeTrimmed || !ativo) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        setLoading(true);

        const formaJaExiste = await verificarFormaExistente(nomeTrimmed);
        if (formaJaExiste) {
            setLoading(false);
            Alert.alert('Erro', 'Esta forma de pagamento já está cadastrada.');
            return;
        }

        const clienteData = {
            nome: nomeTrimmed,
            situacao: ativo,
        };

        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/createforma', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao processar a resposta do servidor.' }));
                setLoading(false);
                Alert.alert('Erro ao Cadastrar', `Falha ao salvar forma de pagamento: ${errorData.message || response.status}`);
                return;
            }

            await response.json();
            setLoading(false);
            Alert.alert('Sucesso', 'Forma de pagamento cadastrada com sucesso!');
            setNome('');
            setAtivo('');

        } catch (error) {
            setLoading(false);
            Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Cadastro de Formas de Pagamento</Text>
            <TextInput
                placeholder="Nome da forma de pagamento"
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                editable={!loading}
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={ativo}
                    onValueChange={(itemValue) => setAtivo(itemValue)}
                    style={styles.picker}
                    enabled={!loading}
                >
                    <Picker.Item label="Situação da forma de pagamento:" value="" enabled={false} style={styles.pickerPlaceholderItem} />
                    <Picker.Item label="Ativo" value="Sim" />
                    <Picker.Item label="Inativo" value="Não" />
                </Picker>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <View style={styles.buttonContainer}>
                    <Button title="Salvar" onPress={handleSalvar} color="#007AFF" />
                </View>
            )}
            <TouchableOpacity style={[styles.backButton, loading && styles.disabledButton]} onPress={() => router.back()} disabled={loading}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333'
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
        fontSize: 16,
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    pickerPlaceholderItem: {
        color: '#9EA0A4'
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    loader: {
        marginVertical: 20,
    },
    disabledButton: {
        opacity: 0.5,
    }
});

export default CadastroPagamento;