import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';

const COLORS = {
    primary: '#007AFF',
    success: '#28a745',
    danger: '#dc3545',
    light: '#f8f9fa',
    dark: '#343a40',
    text: '#495057',
    muted: '#6c757d',
    white: '#fff',
    border: '#dee2e6',
    background: '#f8f9fa',
};

const AtualizarCondicaoPagamento = () => {
    const router = useRouter();

    const [listaCondicoes, setListaCondicoes] = React.useState([]);
    const [selectedCodigo, setSelectedCodigo] = React.useState('');

    const [codPagamento, setCodPagamento] = React.useState('');
    const [quantidadeParcela, setQuantidadeParcela] = React.useState('');
    const [parcelaInicial, setParcelaInicial] = React.useState('');
    const [intervaloParcelas, setIntervaloParcelas] = React.useState('');
    const [descricao, setDescricao] = React.useState('');

    const [loading, setLoading] = React.useState(false);
    const [carregandoCondicoes, setCarregandoCondicoes] = React.useState(true);

    React.useEffect(() => {
        const fetchCondicoes = async () => {
            try {
                const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listcondicoes');
                if (!response.ok) throw new Error('Falha ao buscar condições de pagamento.');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setListaCondicoes(data);
                }
            } catch (error) {
                Alert.alert("Erro", error.message || "Não foi possível carregar as condições de pagamento.");
            } finally {
                setCarregandoCondicoes(false);
            }
        };
        fetchCondicoes();
    }, []);

    const handleSelecaoCondicao = (codigo) => {
        const codigoNum = Number(codigo);
        setSelectedCodigo(codigoNum);
        
        if (codigoNum) {
            const condicao = listaCondicoes.find(c => c.codigo === codigoNum);
            if (condicao) {
                setDescricao(condicao.descricao || '');
                setCodPagamento(String(condicao.codPagamento || ''));
                setQuantidadeParcela(String(condicao.quantidadeParcela || ''));
                setParcelaInicial(String(condicao.parcelaInicial || ''));
                setIntervaloParcelas(String(condicao.intervaloParcelas || ''));
            }
        } else {
            setDescricao('');
            setCodPagamento('');
            setQuantidadeParcela('');
            setParcelaInicial('');
            setIntervaloParcelas('');
        }
    };

    const handleSalvar = async () => {
        if (!selectedCodigo) {
            Alert.alert('Erro', 'Selecione uma condição de pagamento para atualizar.');
            return;
        }
        
        const descricaoTrimmed = descricao.trim();
        if (!descricaoTrimmed || !codPagamento.trim() || !quantidadeParcela.trim() || !parcelaInicial.trim() || !intervaloParcelas.trim()) {
            Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
            return;
        }

        const numCodPagamento = parseInt(codPagamento, 10);
        const numQuantidadeParcela = parseInt(quantidadeParcela, 10);
        const numParcelaInicial = parseInt(parcelaInicial, 10);
        const numIntervaloParcelas = parseInt(intervaloParcelas, 10);

        if (isNaN(numCodPagamento) || isNaN(numQuantidadeParcela) || isNaN(numParcelaInicial) || isNaN(numIntervaloParcelas)) {
            Alert.alert('Erro', 'Todos os campos numéricos devem conter números válidos.');
            return;
        }

        setLoading(true);
        const updateData = {
            descricao: descricaoTrimmed,
            codPagamento: numCodPagamento,
            quantidadeParcela: numQuantidadeParcela,
            parcelaInicial: numParcelaInicial,
            intervaloParcelas: numIntervaloParcelas,
        };

        try {
            const response = await fetch(`https://backend-do-controle-de-estoque.onrender.com/atualizarcondicao/${selectedCodigo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Falha ao atualizar a condição.');
            }

            Alert.alert('Sucesso', 'Condição de pagamento atualizada com sucesso!');
            if (router.canGoBack()) {
                router.back();
            }
        } catch (error) {
            Alert.alert('Erro ao Atualizar', error.message || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Text style={styles.headerText}>Atualizar Condição de Pagamento</Text>

                <View style={styles.sectionContainer}>
                    <Text style={styles.label}>Selecione a Condição para Editar</Text>
                    {carregandoCondicoes ? <ActivityIndicator/> : (
                        <View style={styles.selectionContainer}>
                            <View style={styles.pickerWrapperDescricao}>
                                <Picker
                                    selectedValue={selectedCodigo}
                                    onValueChange={(itemValue) => handleSelecaoCondicao(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Por Descrição..." value="" />
                                    {listaCondicoes.map((cond) => (
                                        <Picker.Item key={cond.codigo} label={cond.descricao} value={cond.codigo}/>
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.pickerWrapperCodigo}>
                                <Picker
                                    selectedValue={selectedCodigo}
                                    onValueChange={(itemValue) => handleSelecaoCondicao(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Cód." value="" />
                                    {listaCondicoes.map((cond) => (
                                        <Picker.Item key={cond.codigo} label={String(cond.codigo)} value={cond.codigo}/>
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    )}
                </View>

                {selectedCodigo ? (
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} editable={!loading} />

                        <Text style={styles.label}>Código da Forma de Pagamento</Text>
                        <TextInput style={styles.input} value={codPagamento} onChangeText={setCodPagamento} editable={!loading} keyboardType="numeric" />

                        <Text style={styles.label}>Quantidade de Parcelas</Text>
                        <TextInput style={styles.input} value={quantidadeParcela} onChangeText={setQuantidadeParcela} editable={!loading} keyboardType="numeric" />

                        <Text style={styles.label}>Parcela Inicial (dias)</Text>
                        <TextInput style={styles.input} value={parcelaInicial} onChangeText={setParcelaInicial} editable={!loading} keyboardType="numeric" />

                        <Text style={styles.label}>Intervalo entre Parcelas (dias)</Text>
                        <TextInput style={styles.input} value={intervaloParcelas} onChangeText={setIntervaloParcelas} editable={!loading} keyboardType="numeric" />
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>Selecione uma condição acima para editar os detalhes.</Text>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryButton, !selectedCodigo && styles.disabledButton]}
                        onPress={handleSalvar}
                        disabled={!selectedCodigo}
                    >
                        <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.secondaryButton, loading && styles.disabledButton]}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={styles.secondaryButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background, justifyContent: 'center' },
    headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.dark },
    sectionContainer: { width: '100%', marginBottom: 20 },
    formContainer: { width: '100%' },
    label: { fontSize: 16, color: COLORS.text, marginBottom: 5, alignSelf: 'flex-start' },
    selectionContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    pickerWrapperDescricao: {
        flex: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        justifyContent: 'center',
        marginRight: 10,
    },
    pickerWrapperCodigo: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    input: {
        backgroundColor: COLORS.white,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: '100%',
        fontSize: 16,
    },
    placeholderText: {
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 16,
        marginVertical: 40,
        fontStyle: 'italic',
    },
    primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 20, },
    primaryButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { backgroundColor: COLORS.muted, paddingVertical: 12, borderRadius: 8, alignItems: 'center', },
    secondaryButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    loader: { marginVertical: 20, },
    disabledButton: { opacity: 0.5 },
});

export default AtualizarCondicaoPagamento;