import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, FlatList, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

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

const CadastroVenda = () => {
    const router = useRouter();
    const { width } = useWindowDimensions();

    const [itensVenda, setItensVenda] = React.useState([]);
    const [desconto, setDesconto] = React.useState('0');
    const [subtotal, setSubtotal] = React.useState(0);
    const [valorTotalFinal, setValorTotalFinal] = React.useState(0);
    const [codProduto, setCodProduto] = React.useState('');
    const [produtoAtual, setProdutoAtual] = React.useState(null);
    const [quantidadeAtual, setQuantidadeAtual] = React.useState('1');
    const [listaProdutos, setListaProdutos] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [carregandoProdutos, setCarregandoProdutos] = React.useState(true);


    React.useEffect(() => {
        const buscarTodosProdutos = async () => {
            try {
                const response = await fetch(`https://backend-do-controle-de-estoque.onrender.com/listprodutos`);
                if (!response.ok) throw new Error('Falha ao carregar lista de produtos');
                const produtos = await response.json();
                if (Array.isArray(produtos)) {
                    setListaProdutos(produtos.map(p => ({...p, precoDeVenda: Number(p.precoDeVenda) })));
                }
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os produtos do seu estoque.');
            } finally {
                setCarregandoProdutos(false);
            }
        };
        buscarTodosProdutos();
    }, []);

    React.useEffect(() => {
        const novoSubtotal = itensVenda.reduce((acc, item) => acc + (item.quantidade * item.precoDeVenda), 0);
        setSubtotal(novoSubtotal);
        const descPercentual = parseFloat(desconto.replace(',', '.')) || 0;
        const valorDesconto = novoSubtotal * (descPercentual / 100);
        const novoTotal = novoSubtotal - valorDesconto;
        setValorTotalFinal(novoTotal < 0 ? 0 : novoTotal);
    }, [itensVenda, desconto]);

    const handleSelecaoProduto = (novoCodigo) => {
        const codigoString = String(novoCodigo || '');
        setCodProduto(codigoString);
        if (!codigoString) {
            setProdutoAtual(null);
            return;
        }
        const produtoEncontrado = listaProdutos.find(p => String(p.codigo) === codigoString);
        if (produtoEncontrado) {
            setProdutoAtual(produtoEncontrado);
        } else {
            setProdutoAtual(null);
        }
    };

    const handleAdicionarItem = () => {
        if (!produtoAtual) {
            Alert.alert('Erro', 'Nenhum produto válido selecionado.');
            return;
        }
        const qtd = parseInt(quantidadeAtual, 10);
        if (isNaN(qtd) || qtd <= 0) {
            Alert.alert('Erro', 'A quantidade deve ser um número maior que zero.');
            return;
        }
        setItensVenda(prevItens => {
            const itemExistente = prevItens.find(item => item.codigo === produtoAtual.codigo);
            if (itemExistente) {
                return prevItens.map(item =>
                    item.codigo === produtoAtual.codigo
                        ? { ...item, quantidade: item.quantidade + qtd }
                        : item
                );
            } else {
                return [...prevItens, { ...produtoAtual, quantidade: qtd }];
            }
        });
        setProdutoAtual(null);
        setCodProduto('');
        setQuantidadeAtual('1');
    };

    const handleEditarQuantidade = (codigo, novaQuantidadeStr) => {
        const novaQuantidadeNum = parseInt(novaQuantidadeStr, 10);
        const quantidadeValida = isNaN(novaQuantidadeNum) || novaQuantidadeNum < 0 ? 0 : novaQuantidadeNum;
        setItensVenda(prevItens =>
            prevItens.map(item =>
                item.codigo === codigo
                    ? { ...item, quantidade: quantidadeValida }
                    : item
            )
        );
    };

    const handleRemoverItem = (codigoARemover) => {
        setItensVenda(prevItens => prevItens.filter(item => item.codigo !== codigoARemover));
    };

    const handleSalvar = async () => {
        if (itensVenda.length === 0) {
            Alert.alert('Erro', 'Adicione pelo menos um produto à venda.');
            return;
        }
        if (itensVenda.some(item => item.quantidade <= 0)) {
            Alert.alert('Erro', 'Todos os itens devem ter quantidade maior que zero.');
            return;
        }
        setLoading(true);
        const vendaData = {
            desconto: parseFloat(desconto.replace(',', '.')) || 0,
            valorTotal: valorTotalFinal,
            itens: itensVenda.map(item => ({
                codProduto: item.codigo,
                quantidade: item.quantidade,
                precoUnitario: item.precoDeVenda,
            })),
        };
        try {
            const response = await fetch(`https://backend-do-controle-de-estoque.onrender.com/createvenda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vendaData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Falha ao salvar a venda.');
            }
            await response.json();
            Alert.alert('Sucesso', 'Venda registrada com sucesso!');
            setItensVenda([]);
            setDesconto('0');
        } catch (error) {
            Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };
    
    let pickerFontSize = 16;
    if (width < 400) {
        pickerFontSize = 14;
    }
    if (width < 350) {
        pickerFontSize = 12;
    }

    const styles = getDynamicStyles(pickerFontSize);

    const renderItemVenda = ({ item }) => (
        <View style={styles.itemVendaContainer}>
            <View style={styles.itemVendaInfo}>
                <Text style={styles.itemVendaNome} numberOfLines={1}>{item.produto}</Text>
                <Text style={styles.itemVendaPrecoUnitario}>R$ {item.precoDeVenda.toFixed(2)} / un.</Text>
            </View>
            <View style={styles.itemVendaAcoes}>
                <TextInput
                    style={styles.itemQuantidadeInput}
                    value={String(item.quantidade)}
                    onChangeText={(novaQtd) => handleEditarQuantidade(item.codigo, novaQtd)}
                    keyboardType="numeric"
                    selectTextOnFocus
                />
                <TouchableOpacity style={styles.botaoRemover} onPress={() => handleRemoverItem(item.codigo)}>
                    <Ionicons name="trash-bin-outline" size={22} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Text style={styles.headerText}>Nova Venda</Text>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>1. Adicionar Produto</Text>
                    {carregandoProdutos ? <ActivityIndicator/> : (
                         <View style={styles.searchContainer}>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={codProduto}
                                    onValueChange={(itemValue) => handleSelecaoProduto(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Selecione por nome..." value="" style={styles.pickerItem}/>
                                    {listaProdutos.map(p => (
                                        <Picker.Item key={p.codigo} label={p.produto || `Cód. ${p.codigo}`} value={String(p.codigo)} style={styles.pickerItem}/>
                                    ))}
                                </Picker>
                            </View>
                            <TextInput
                                placeholder="Cód."
                                style={styles.codigoInput}
                                value={codProduto}
                                onChangeText={handleSelecaoProduto}
                                keyboardType="numeric"
                            />
                         </View>
                    )}

                    {produtoAtual && (
                        <View style={styles.produtoEncontradoContainer}>
                            <Text style={styles.produtoEncontradoNome}>{produtoAtual.produto}</Text>
                            <Text style={styles.produtoEncontradoPreco}>Preço Unitário: R$ {produtoAtual.precoDeVenda.toFixed(2)}</Text>
                            <View style={styles.addItemContainer}>
                                <TextInput
                                    placeholder="Qtd."
                                    style={styles.quantidadeInput}
                                    value={quantidadeAtual}
                                    onChangeText={setQuantidadeAtual}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.adicionarButton} onPress={handleAdicionarItem}>
                                    <Text style={styles.adicionarButtonText}>Adicionar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>2. Itens da Venda</Text>
                    <FlatList
                        data={itensVenda}
                        renderItem={renderItemVenda}
                        keyExtractor={(item) => item.codigo.toString()}
                        ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum produto adicionado</Text>}
                    />
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>3. Resumo e Finalização</Text>
                    <View style={styles.resumoLinha}>
                        <Text style={styles.resumoLabel}>Subtotal:</Text>
                        <Text style={styles.resumoValor}>R$ {subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.resumoLinha}>
                        <Text style={styles.resumoLabel}>Desconto (%):</Text>
                        <TextInput
                            style={styles.descontoInput}
                            value={desconto}
                            onChangeText={setDesconto}
                            keyboardType="decimal-pad"
                        />
                    </View>
                    <View style={styles.resumoLinhaTotal}>
                        <Text style={styles.totalLabel}>TOTAL:</Text>
                        <Text style={styles.totalValue}>R$ {valorTotalFinal.toFixed(2)}</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : (
                    <TouchableOpacity style={[styles.primaryButton, itensVenda.length === 0 && styles.disabledButton]} onPress={handleSalvar} disabled={itensVenda.length === 0}>
                        <Text style={styles.primaryButtonText}>Finalizar Venda</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.secondaryButton, loading && styles.disabledButton]} onPress={() => router.back()} disabled={loading}>
                    <Text style={styles.secondaryButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const getDynamicStyles = (pickerFontSize) => StyleSheet.create({
    scrollContainer: { flexGrow: 1, },
    container: { padding: 15, backgroundColor: COLORS.background },
    headerText: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.dark },
    sectionContainer: { marginBottom: 20, backgroundColor: COLORS.white, padding: 15, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3, },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: COLORS.text },
    searchContainer: { flexDirection: 'row', alignItems: 'center', },
    pickerWrapper: { flex: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginRight: 10, justifyContent: 'center', },
    picker: { height: 48, fontSize: pickerFontSize, },
    pickerItem: { fontSize: pickerFontSize, color: '#000' },
    codigoInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 8, fontSize: 16, textAlign: 'center', },
    produtoEncontradoContainer: { marginTop: 15, padding: 15, backgroundColor: COLORS.light, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
    produtoEncontradoNome: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
    produtoEncontradoPreco: { fontSize: 14, color: COLORS.muted, marginBottom: 10 },
    addItemContainer: { flexDirection: 'row', alignItems: 'center', },
    quantidadeInput: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, width: 70, textAlign: 'center', fontSize: 16, marginRight: 10 },
    adicionarButton: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, },
    adicionarButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    listaVazia: { textAlign: 'center', color: COLORS.muted, paddingVertical: 20, fontStyle: 'italic', backgroundColor: COLORS.white, marginHorizontal: -15, padding: 15 },
    itemVendaContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white, paddingHorizontal: 15, marginHorizontal: -15 },
    itemVendaInfo: { flex: 1, },
    itemVendaNome: { fontSize: 16, fontWeight: '500', color: COLORS.dark },
    itemVendaPrecoUnitario: { fontSize: 14, color: COLORS.muted, },
    itemVendaAcoes: { flexDirection: 'row', alignItems: 'center', },
    itemQuantidadeInput: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, width: 60, textAlign: 'center', fontSize: 16, },
    botaoRemover: { paddingLeft: 15, },
    resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
    resumoLinhaTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
    resumoLabel: { fontSize: 16, color: COLORS.text },
    resumoValor: { fontSize: 16, fontWeight: '500', color: COLORS.dark },
    descontoInput: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, width: 70, textAlign: 'right', fontSize: 16, },
    totalLabel: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
    totalValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.success },
    primaryButton: { backgroundColor: COLORS.success, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10, },
    primaryButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { backgroundColor: COLORS.muted, paddingVertical: 12, borderRadius: 8, alignItems: 'center', },
    secondaryButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    loader: { marginVertical: 20, },
    disabledButton: { opacity: 0.5 },
});

export default CadastroVenda;