import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from "expo-router";

const CadastroCondicaoPagamento = () => {
    const router = useRouter();
    const [codPagamento, setCodPagamento] = React.useState('');
    const [quantidadeParcela, setQuantidadeParcela] = React.useState('');
    const [parcelaInicial, setParcelaInicial] = React.useState('');
    const [intervaloParcelas, setIntervaloParcelas] = React.useState('');
    const [descricao, setDescricao] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const verificarCondicaoExistente = async (codigoStr) => {
        const codigoNum = parseInt(codigoStr, 10);
        if (isNaN(codigoNum)) {
            console.warn('Código da condição inválido para verificação.');
            return false;
        }

        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listcondicoes');
            if (!response.ok) {
                console.warn('Não foi possível buscar condições de pagamento existentes para verificação.');
                return false;
            }
            const condicoesExistentes = await response.json();

            if (Array.isArray(condicoesExistentes)) {
                return condicoesExistentes.some(cond => cond.codPagamento === codigoNum);
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar condição de pagamento existente:', error);
            return false;
        }
    };

    const handleSalvar = async () => {
        const codPagamentoTrimmed = codPagamento.trim();
        const descricaoTrimmed = descricao.trim();

        if (!codPagamentoTrimmed || !quantidadeParcela.trim() || !parcelaInicial.trim() || !intervaloParcelas.trim() || !descricaoTrimmed) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        const numCodPagamento = parseInt(codPagamentoTrimmed, 10);
        const numQuantidadeParcela = parseInt(quantidadeParcela, 10);
        const numParcelaInicial = parseInt(parcelaInicial, 10);
        const numIntervaloParcelas = parseInt(intervaloParcelas, 10);

        if (isNaN(numCodPagamento)) {
            Alert.alert('Erro', 'Código da Condição deve ser um número válido.');
            return;
        }
        if (isNaN(numQuantidadeParcela) || isNaN(numParcelaInicial) || isNaN(numIntervaloParcelas)) {
            Alert.alert('Erro', 'Quantidade de parcelas, parcela inicial e intervalo devem ser números válidos.');
            return;
        }

        setLoading(true);

        const condicaoJaExiste = await verificarCondicaoExistente(codPagamentoTrimmed);
        if (condicaoJaExiste) {
            setLoading(false);
            Alert.alert('Erro', 'Uma condição de pagamento com este código já está cadastrada.');
            return;
        }

        const condicaoPagamentoData = {
            codPagamento: numCodPagamento,
            quantidadeParcela: numQuantidadeParcela,
            parcelaInicial: numParcelaInicial,
            intervaloParcelas: numIntervaloParcelas,
            descricao: descricaoTrimmed,
        };

        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/createcondicao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(condicaoPagamentoData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao processar a resposta do servidor.' }));
                setLoading(false);
                Alert.alert('Erro ao Cadastrar', `Falha ao salvar condição de pagamento: ${errorData.message || response.status}`);
                return;
            }

            await response.json();
            setLoading(false);
            Alert.alert('Sucesso', 'Condição de pagamento cadastrada com sucesso!');
            setCodPagamento('');
            setQuantidadeParcela('');
            setParcelaInicial('');
            setIntervaloParcelas('');
            setDescricao('');

        } catch (error) {
            setLoading(false);
            Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
            console.error(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Text style={styles.headerText}>Cadastro de Condições de Pagamento</Text>
                <TextInput
                    placeholder="Código da Condição (ex: 1, 2, 30)"
                    style={styles.input}
                    value={codPagamento}
                    onChangeText={setCodPagamento}
                    editable={!loading}
                    keyboardType="numeric"
                />
                <TextInput
                    placeholder="Descrição (ex: 3 Parcelas Iguais)"
                    style={styles.input}
                    value={descricao}
                    onChangeText={setDescricao}
                    editable={!loading}
                />
                <TextInput
                    placeholder="Quantidade de Parcelas"
                    style={styles.input}
                    value={quantidadeParcela}
                    onChangeText={setQuantidadeParcela}
                    editable={!loading}
                    keyboardType="numeric"
                />
                <TextInput
                    placeholder="Parcela Inicial (dias após a compra)"
                    style={styles.input}
                    value={parcelaInicial}
                    onChangeText={setParcelaInicial}
                    editable={!loading}
                    keyboardType="numeric"
                />
                <TextInput
                    placeholder="Intervalo entre Parcelas (dias)"
                    style={styles.input}
                    value={intervaloParcelas}
                    onChangeText={setIntervaloParcelas}
                    editable={!loading}
                    keyboardType="numeric"
                />

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
        </ScrollView>
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center',
        color: '#333'
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
        fontSize: 16,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 15,
        marginBottom: 15,
    },
    backButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 5,
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

export default CadastroCondicaoPagamento;