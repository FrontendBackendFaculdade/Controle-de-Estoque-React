import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';

const CadastroCondicaoPagamento = () => {
    const router = useRouter();
    const [formasPagamento, setFormasPagamento] = useState([]);
    const [codFormaPagamento, setCodFormaPagamento] = useState(null);
    const [nomeFormaPagamento, setNomeFormaPagamento] = useState('');
    const [quantidadeParcela, setQuantidadeParcela] = useState('');
    const [parcelaInicial, setParcelaInicial] = useState('');
    const [intervaloParcelas, setIntervaloParcelas] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const buscarFormasPagamento = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listformas');
                if (!response.ok) {
                    throw new Error('Não foi possível carregar as formas de pagamento.');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setFormasPagamento(data);
                }
            } catch (error) {
                Alert.alert('Erro', error.message);
                console.error('Erro ao buscar formas de pagamento:', error);
            } finally {
                setLoading(false);
            }
        };

        buscarFormasPagamento();
    }, []);

    const handleSalvar = async () => {
        const descricaoTrimmed = descricao.trim();

        if (!codFormaPagamento || !quantidadeParcela.trim() || !parcelaInicial.trim() || !intervaloParcelas.trim() || !descricaoTrimmed) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        const numQuantidadeParcela = parseInt(quantidadeParcela, 10);
        const numParcelaInicial = parseInt(parcelaInicial, 10);
        const numIntervaloParcelas = parseInt(intervaloParcelas, 10);

        if (isNaN(numQuantidadeParcela) || isNaN(numParcelaInicial) || isNaN(numIntervaloParcelas)) {
            Alert.alert('Erro', 'Quantidade de parcelas, parcela inicial e intervalo devem ser números válidos.');
            return;
        }

        setLoading(true);

        const condicaoPagamentoData = {
            codPagamento: codFormaPagamento,
            quantidadeParcela: numQuantidadeParcela,
            parcelaInicial: numParcelaInicial,
            intervaloParcelas: numIntervaloParcelas,
            descricao: descricaoTrimmed,
        };

        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/createcondicao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(condicaoPagamentoData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
                throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
            }

            setLoading(false);
            Alert.alert('Sucesso', 'Condição de pagamento cadastrada com sucesso!');
            setCodFormaPagamento(null);
            setNomeFormaPagamento('');
            setQuantidadeParcela('');
            setParcelaInicial('');
            setIntervaloParcelas('');
            setDescricao('');

        } catch (error) {
            setLoading(false);
            Alert.alert('Erro ao Salvar', error.message);
            console.error(error);
        }
    };

    const handlePickerChange = (itemValue, itemIndex) => {
        setCodFormaPagamento(itemValue);
        if (itemValue) {
            const formaSelecionada = formasPagamento.find(f => f.codigo === itemValue);
            setNomeFormaPagamento(formaSelecionada ? formaSelecionada.nome : '');
        } else {
            setNomeFormaPagamento('');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Text style={styles.headerText}>Cadastro de Condições de Pagamento</Text>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={codFormaPagamento}
                        onValueChange={handlePickerChange}
                        enabled={!loading && formasPagamento.length > 0}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione uma Forma de Pagamento..." value={null} />
                        {formasPagamento.map((forma) => (
                            <Picker.Item key={forma.codigo} label={forma.nome} value={forma.codigo} />
                        ))}
                    </Picker>
                </View>

                {nomeFormaPagamento ? (
                    <Text style={styles.infoText}>
                        Condição para: <Text style={styles.infoTextBold}>{nomeFormaPagamento}</Text>
                    </Text>
                ) : null}

                <TextInput
                    placeholder="Descrição (ex: 3x Sem Juros no Cartão)"
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
    pickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
    },
    picker: {
        width: '100%',
        height: 50,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },
    infoTextBold: {
        fontWeight: 'bold',
        color: '#333',
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