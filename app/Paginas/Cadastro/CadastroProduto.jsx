import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';

const UNIDADES_OPCOES = ["UN", "KG", "CX", "LT", "PC", "G", "M"];
const SETORES_OPCOES = ["Eletrônicos", "Alimentos", "Bebidas", "Limpeza", "Roupas", "Outros"];

const CadastroProduto = () => {
    const router = useRouter();
    const [nomeProduto, setNomeProduto] = React.useState('');
    const [tipoUnidade, setTipoUnidade] = React.useState('');
    const [setor, setSetor] = React.useState('');
    const [quantidade, setQuantidade] = React.useState('');
    const [custoCompra, setCustoCompra] = React.useState('');
    const [margemLucro, setMargemLucro] = React.useState('');
    const [precoDeVenda, setPrecoDeVenda] = React.useState('');
    const [ativo, setAtivo] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const calcularPrecoVenda = (custo, margem) => {
        if (custo > 0 && margem >= 0) {
            const preco = custo * (1 + margem / 100);
            return preco.toFixed(2);
        }
        return '';
    };
    
    const calcularMargemLucro = (custo, preco) => {
        if (custo > 0 && preco > 0) {
            const margem = ((preco / custo) - 1) * 100;
            return margem.toFixed(2);
        }
        return '';
    };

    const handleCustoCompraChange = (text) => {
        setCustoCompra(text);
        const custoNum = parseFloat(text.replace(',', '.')) || 0;
        const margemNum = parseFloat(margemLucro.replace(',', '.')) || 0;
        setPrecoDeVenda(calcularPrecoVenda(custoNum, margemNum));
    };

    const handleMargemLucroChange = (text) => {
        setMargemLucro(text);
        const custoNum = parseFloat(custoCompra.replace(',', '.')) || 0;
        const margemNum = parseFloat(text.replace(',', '.')) || 0;
        setPrecoDeVenda(calcularPrecoVenda(custoNum, margemNum));
    };

    const handlePrecoDeVendaChange = (text) => {
        setPrecoDeVenda(text);
        const custoNum = parseFloat(custoCompra.replace(',', '.')) || 0;
        const precoNum = parseFloat(text.replace(',', '.')) || 0;
        setMargemLucro(calcularMargemLucro(custoNum, precoNum));
    };

    const verificarProdutoExistente = async (nomeProd) => {
        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listprodutos');
            if (!response.ok) {
                console.warn('Não foi possível buscar produtos existentes para verificação.');
                return false;
            }
            const produtosExistentes = await response.json();
            if (Array.isArray(produtosExistentes)) {
                return produtosExistentes.some(prd =>
                    prd.produto && prd.produto.toLowerCase() === nomeProd.toLowerCase()
                );
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar produto existente:', error);
            return false;
        }
    };

    const handleSalvar = async () => {
        const nomeProdutoTrimmed = nomeProduto.trim();
        const setorTrimmed = setor;
        const tipoUnidadeTrimmed = tipoUnidade;

        if (!nomeProdutoTrimmed || !tipoUnidadeTrimmed || !setorTrimmed ||
            !quantidade.trim() || !custoCompra.trim() || !margemLucro.trim() ||
            !precoDeVenda.trim() || !ativo) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        const numQuantidade = parseInt(quantidade, 10);
        const numCustoCompra = parseFloat(custoCompra.replace(',', '.'));
        const numMargemLucro = parseFloat(margemLucro.replace(',', '.'));
        const numPrecoDeVenda = parseFloat(precoDeVenda.replace(',', '.'));

        if (isNaN(numQuantidade) || isNaN(numCustoCompra) || isNaN(numMargemLucro) || isNaN(numPrecoDeVenda)) {
            Alert.alert('Erro', 'Quantidade, Custo, Margem e Preço de Venda devem ser números válidos.');
            return;
        }
        if (numQuantidade < 0 || numCustoCompra < 0 || numPrecoDeVenda < 0) {
            Alert.alert('Erro', 'Valores numéricos (exceto margem) não podem ser negativos.');
            return;
        }

        setLoading(true);

        const produtoJaExiste = await verificarProdutoExistente(nomeProdutoTrimmed);
        if (produtoJaExiste) {
            setLoading(false);
            Alert.alert('Erro', 'Um produto with este nome já está cadastrado.');
            return;
        }

        const produtoData = {
            produto: nomeProdutoTrimmed,
            tipoUnidade: tipoUnidadeTrimmed,
            setor: setorTrimmed,
            quantidade: numQuantidade,
            custoCompra: numCustoCompra,
            margemLucro: numMargemLucro,
            precoDeVenda: numPrecoDeVenda,
            ativo: ativo,
        };

        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/createprodutos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(produtoData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
                setLoading(false);
                Alert.alert('Erro ao Cadastrar', `Falha ao salvar produto: ${errorData.message || response.status}`);
                return;
            }
            await response.json();
            setLoading(false);
            Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
            setNomeProduto('');
            setTipoUnidade('');
            setSetor('');
            setQuantidade('');
            setCustoCompra('');
            setMargemLucro('');
            setPrecoDeVenda('');
            setAtivo('');

        } catch (error) {
            setLoading(false);
            Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
            console.error(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Text style={styles.headerText}>Cadastro de Produto</Text>
                
                <TextInput placeholder="Nome do Produto" style={styles.input} value={nomeProduto} onChangeText={setNomeProduto} editable={!loading} />

                <View style={styles.pickerContainer}>
                    <Picker selectedValue={tipoUnidade} onValueChange={(itemValue) => setTipoUnidade(itemValue)} style={styles.picker} enabled={!loading}>
                        <Picker.Item label="Selecione o Tipo de Unidade..." value="" />
                        {UNIDADES_OPCOES.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker selectedValue={setor} onValueChange={(itemValue) => setSetor(itemValue)} style={styles.picker} enabled={!loading}>
                        <Picker.Item label="Selecione o Setor/Categoria..." value="" />
                        {SETORES_OPCOES.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
                    </Picker>
                </View>

                <TextInput placeholder="Quantidade em Estoque" style={styles.input} value={quantidade} onChangeText={setQuantidade} editable={!loading} keyboardType="numeric" />
                <TextInput placeholder="Custo de Compra (ex: 10.50)" style={styles.input} value={custoCompra} onChangeText={handleCustoCompraChange} editable={!loading} keyboardType="decimal-pad" />
                <TextInput placeholder="Margem de Lucro (%) (ex: 25)" style={styles.input} value={margemLucro} onChangeText={handleMargemLucroChange} editable={!loading} keyboardType="decimal-pad" />
                <TextInput placeholder="Preço de Venda (ex: 13.13)" style={styles.input} value={precoDeVenda} onChangeText={handlePrecoDeVendaChange} editable={!loading} keyboardType="decimal-pad" />
                
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={ativo} onValueChange={(itemValue) => setAtivo(itemValue)} style={styles.picker} enabled={false}>
                        <Picker.Item label="Ativo" value="Sim" />
                    </Picker>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
                ) : (
                    <View style={styles.buttonContainer}>
                        <Button title="Salvar Produto" onPress={handleSalvar} color="#007AFF" />
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
    pickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        height: 50,
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

export default CadastroProduto;