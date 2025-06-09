import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Platform,
    useWindowDimensions,
    SafeAreaView,
    StatusBar,
    Keyboard,
    RefreshControl
} from 'react-native';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F97316',
    light: '#F8FAFC',
    lighter: '#F1F5F9',
    dark: '#1E293B',
    text: '#334155',
    textLight: '#64748B',
    white: '#FFFFFF',
    border: '#E2E8F0',
    background: '#F8FAFC',
    cardShadow: '#0F172A',
    success: '#059669',
    gradient: ['#2563EB', '#1D4ED8'],
    focus: '#3B82F6',
    disabled: '#9CA3AF',
    surface: '#FFFFFF',
    onSurface: '#1F2937',
};

const getDynamicStyles = (pickerFontSize, screenWidth) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.primary },
    container: { flex: 1, backgroundColor: COLORS.background },
    headerGradient: { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20, paddingBottom: 30, paddingHorizontal: 20 },
    headerContent: { alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 8, textAlign: 'center' },
    headerSubtitle: { fontSize: 16, color: COLORS.white, opacity: 0.9, textAlign: 'center' },
    scrollContent: { paddingBottom: 120 },
    sectionCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: COLORS.white, borderRadius: 16, padding: 20, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: COLORS.border },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionIcon: { marginRight: 12, padding: 8, backgroundColor: COLORS.lighter, borderRadius: 8, position: 'relative' },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.dark, flex: 1 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginLeft: 4 },
    pickerContainer: { backgroundColor: COLORS.lighter, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, overflow: 'hidden', shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    pickerContainerFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white, shadowOpacity: 0.1, elevation: 4 },
    pickerDisabled: { backgroundColor: COLORS.disabled, opacity: 0.6, borderColor: COLORS.disabled },
    picker: { height: 56, width: '100%', fontSize: pickerFontSize, color: COLORS.text, },
    pickerTextDisabled: { color: COLORS.disabled },
    dependencyHint: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic', marginTop: 4, marginLeft: 4, },
    warningHint: { fontSize: 12, color: COLORS.warning, fontStyle: 'italic', marginTop: 4, marginLeft: 4, },
    searchContainer: { marginBottom: 16 },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lighter, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, height: 56, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    searchInputFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white, shadowOpacity: 0.1, elevation: 4 },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, color: COLORS.text, height: '100%' },
    searchResults: { maxHeight: 200, marginTop: 8, borderRadius: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
    searchResultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, minHeight: 56 },
    searchResultName: { fontSize: 16, color: COLORS.text, flex: 1, fontWeight: '500' },
    searchResultPrice: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
    emptyState: { textAlign: 'center', color: COLORS.textLight, paddingVertical: 32, fontSize: 16, fontStyle: 'italic' },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, minHeight: 80 },
    itemInfo: { flex: 1, marginRight: 16 },
    itemName: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
    itemPrice: { fontSize: 14, color: COLORS.textLight },
    itemActions: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lighter, borderRadius: 8, padding: 4 },
    quantityButton: { padding: 8, borderRadius: 6, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
    quantityText: { fontSize: 18, fontWeight: '700', color: COLORS.primary, minWidth: 40, textAlign: 'center', paddingHorizontal: 8 },
    summaryCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: COLORS.white, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: COLORS.primary, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, minHeight: 44 },
    summaryLabel: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
    summaryValue: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
    descontoInput: { borderWidth: 2, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, width: 80, textAlign: 'center', fontSize: 16, fontWeight: '600', backgroundColor: COLORS.lighter, minHeight: 44 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
    totalLabel: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
    totalValue: { fontSize: 24, fontWeight: '800', color: COLORS.success },
    footerContainer: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16 },
    buttonRow: { flexDirection: 'row', gap: 12 },
    button: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
    primaryButton: { backgroundColor: COLORS.success, shadowColor: COLORS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    secondaryButton: { backgroundColor: COLORS.textLight, },
    buttonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
    disabledButton: { opacity: 0.5 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    loadingText: { marginTop: 16, fontSize: 18, color: COLORS.text, fontWeight: '500' },
    badge: { position: 'absolute', top: -8, right: -8, backgroundColor: COLORS.accent, borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
    badgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});

const HeaderComponent = React.memo(({ 
    listaClientes, 
    listaFormas, 
    listaCondicoes,
    condicoesFiltradas,
    selectedCliente, 
    setSelectedCliente,
    selectedForma, 
    setSelectedForma,
    selectedCondicao, 
    setSelectedCondicao,
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    searchResults,
    handleAdicionarOuAtualizarItem,
    itensVenda,
    styles,
    COLORS
}) => (
    <>
        <LinearGradient colors={COLORS.gradient} style={styles.headerGradient}>
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Nova Venda</Text>
                <Text style={styles.headerSubtitle}>
                    Sistema de Vendas Profissional
                </Text>
            </View>
        </LinearGradient>

        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cliente *</Text>
                <View style={[
                    styles.pickerContainer,
                    selectedCliente && styles.pickerContainerFocused
                ]}>
                    <Picker
                        selectedValue={selectedCliente}
                        onValueChange={setSelectedCliente}
                        style={styles.picker}
                        accessibilityLabel="Selecionar cliente"
                    >
                        <Picker.Item label="Selecione o cliente..." value="" />
                        {listaClientes?.map(c => (
                            <Picker.Item key={c.codigo} label={c.nome} value={c.codigo} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Forma de Pagamento *</Text>
                <View style={[
                    styles.pickerContainer,
                    selectedForma && styles.pickerContainerFocused
                ]}>
                    <Picker
                        selectedValue={selectedForma}
                        onValueChange={setSelectedForma}
                        style={styles.picker}
                        accessibilityLabel="Selecionar forma de pagamento"
                    >
                        <Picker.Item label="Selecione a forma..." value="" />
                        {listaFormas?.map(f => (
                            <Picker.Item key={f.codigo} label={f.nome} value={f.codigo} />
                        ))}
                    </Picker>
                </View>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condição de Pagamento *</Text>
                <View style={[
                    styles.pickerContainer,
                    selectedCondicao && styles.pickerContainerFocused,
                    !selectedForma && styles.pickerDisabled
                ]}>
                    <Picker
                        selectedValue={selectedCondicao}
                        onValueChange={setSelectedCondicao}
                        style={[
                            styles.picker,
                            !selectedForma && styles.pickerTextDisabled
                        ]}
                        enabled={!!selectedForma}
                        accessibilityLabel="Selecionar condição de pagamento"
                    >
                        <Picker.Item 
                            label={!selectedForma ? "Selecione uma forma primeiro..." : "Selecione a condição..."} 
                            value="" 
                        />
                        {condicoesFiltradas?.map(c => (
                            <Picker.Item 
                                key={c.codigo} 
                                label={c.descricao} 
                                value={c.codigo} 
                            />
                        ))}
                    </Picker>
                </View>
                {!selectedForma && (
                    <Text style={styles.dependencyHint}>
                        💡 Selecione uma forma de pagamento primeiro
                    </Text>
                )}
                {selectedForma && condicoesFiltradas?.length === 0 && (
                    <Text style={styles.warningHint}>
                        ⚠️ Nenhuma condição disponível para esta forma de pagamento
                    </Text>
                )}
            </View>
        </View>
        
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="search-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Buscar Produtos</Text>
            </View>
            
            <View style={styles.searchContainer}>
                <View style={[
                    styles.searchInputContainer,
                    searchFocused && styles.searchInputFocused
                ]}>
                    <Ionicons
                        name="search"
                        size={20}
                        color={searchFocused ? COLORS.primary : COLORS.textLight}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        placeholder="Digite o nome do produto..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholderTextColor={COLORS.textLight}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>
                
                {searchQuery.length > 0 && (
                    <View style={styles.searchResults}>
                        <FlatList
                            data={searchResults}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.searchResultItem}
                                    onPress={() => handleAdicionarOuAtualizarItem(item)}
                                    accessibilityLabel={`Adicionar ${item.produto} por R$ ${item.precoDeVenda.toFixed(2)}`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.searchResultName}>
                                        {item.produto}
                                    </Text>
                                    <Text style={styles.searchResultPrice}>
                                        R$ {item.precoDeVenda.toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.codigo.toString()}
                            ListEmptyComponent={
                                <Text style={styles.emptyState}>
                                    Nenhum produto encontrado
                                </Text>
                            }
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>
        </View>
        
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
                <Ionicons name="list-outline" size={24} color={COLORS.primary} />
                {itensVenda.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{itensVenda.length}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.sectionTitle}>Itens da Venda</Text>
        </View>
    </>
));

const FooterComponent = React.memo(({ 
    subtotal, 
    desconto, 
    setDesconto, 
    valorTotalFinal, 
    styles, 
    COLORS 
}) => (
    <View style={styles.summaryCard}>
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
                <Ionicons name="calculator-outline" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.sectionTitle}>Resumo da Venda</Text>
        </View>
        
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto (%):</Text>
            <TextInput
                style={styles.descontoInput}
                value={desconto}
                onChangeText={setDesconto}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                accessibilityLabel="Campo de desconto em porcentagem"
                maxLength={5}
            />
        </View>
        
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL FINAL:</Text>
            <Text style={styles.totalValue}>R$ {valorTotalFinal.toFixed(2)}</Text>
        </View>
    </View>
));

const CadastroVenda = () => {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const searchInputRef = React.useRef(null);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [listaClientes, setListaClientes] = useState([]);
    const [listaFormas, setListaFormas] = useState([]);
    const [listaCondicoes, setListaCondicoes] = useState([]);
    const [listaProdutos, setListaProdutos] = useState([]);

    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedForma, setSelectedForma] = useState('');
    const [selectedCondicao, setSelectedCondicao] = useState('');

    const [itensVenda, setItensVenda] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [desconto, setDesconto] = useState('0');
    const [subtotal, setSubtotal] = useState(0);
    const [valorTotalFinal, setValorTotalFinal] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            const [clientesRes, formasRes, condicoesRes, produtosRes] = await Promise.all([
                fetch('https://backend-do-controle-de-estoque.onrender.com/listclientes'),
                fetch('https://backend-do-controle-de-estoque.onrender.com/listformas'),
                fetch('https://backend-do-controle-de-estoque.onrender.com/listcondicoes'),
                fetch('https://backend-do-controle-de-estoque.onrender.com/listprodutos')
            ]);
            if (!clientesRes.ok || !formasRes.ok || !condicoesRes.ok || !produtosRes.ok) throw new Error('Falha ao buscar dados iniciais.');
            
            const [clientesData, formasData, condicoesData, produtosData] = await Promise.all([
                clientesRes.json(),
                formasRes.json(),
                condicoesRes.json(),
                produtosRes.json()
            ]);

            if (Array.isArray(clientesData)) setListaClientes(clientesData);
            if (Array.isArray(formasData)) setListaFormas(formasData);
            if (Array.isArray(condicoesData)) setListaCondicoes(condicoesData);
            if (Array.isArray(produtosData)) {
                setListaProdutos(produtosData.map(p => ({
                    ...p,
                    precoDeVenda: Number(p.precoDeVenda),
                    custoCompra: Number(p.custoCompra),
                })));
            }
        } catch (e) {
            console.error("Erro ao buscar dados:", e);
            Alert.alert("Erro", "Não foi possível carregar os dados necessários.");
        } finally {
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const condicoesFiltradas = useCallback(() => {
        if (!selectedForma || !listaCondicoes.length) return [];
        return listaCondicoes.filter(cond => cond.codPagamento === selectedForma);
    }, [selectedForma, listaCondicoes]);

    useEffect(() => {
        if (selectedCondicao) {
            const condicoesDisponiveis = condicoesFiltradas();
            const condicaoValida = condicoesDisponiveis.find(c => c.codigo === selectedCondicao);
            if (!condicaoValida) setSelectedCondicao('');
        }
    }, [selectedForma, selectedCondicao, condicoesFiltradas]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }
        setSearchResults(listaProdutos.filter(p =>
            p.produto && p.produto.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    }, [searchQuery, listaProdutos]);

    useEffect(() => {
        const novoSubtotal = itensVenda.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
        setSubtotal(novoSubtotal);
        const descPercentual = parseFloat(desconto.replace(',', '.')) || 0;
        const valorDesconto = novoSubtotal * (descPercentual / 100);
        const novoTotal = novoSubtotal - valorDesconto;
        setValorTotalFinal(novoTotal < 0 ? 0 : novoTotal);
    }, [itensVenda, desconto]);

    const handleFormaChange = useCallback((novaForma) => {
        setSelectedForma(novaForma);
        if (selectedCondicao) setSelectedCondicao('');
    }, [selectedCondicao]);

    const handleAdicionarOuAtualizarItem = useCallback((produtoSelecionado) => {
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
        setItensVenda(prevItens => {
            const itemExistente = prevItens.find(item => item.codProduto === produtoSelecionado.codigo);
            if (itemExistente) {
                return prevItens.map(item =>
                    item.codProduto === produtoSelecionado.codigo ? { ...item, quantidade: item.quantidade + 1 } : item
                );
            } else {
                return [...prevItens, {
                    codProduto: produtoSelecionado.codigo,
                    nomeProduto: produtoSelecionado.produto,
                    quantidade: 1,
                    precoUnitario: produtoSelecionado.precoDeVenda,
                    custoProduto: produtoSelecionado.custoCompra || "0",
                }];
            }
        });
    }, []);

    const handleAjustarQuantidade = useCallback((codProduto, ajuste) => {
        setItensVenda(prevItens =>
            prevItens.map(item =>
                item.codProduto === codProduto ? { ...item, quantidade: item.quantidade + ajuste } : item
            ).filter(item => item.quantidade > 0)
        );
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleSalvar = async () => {
        if (!selectedCliente || !selectedForma || !selectedCondicao || itensVenda.length === 0) {
            Alert.alert('Validação', 'Preencha todos os dados e adicione pelo menos um item.');
            return;
        }
        setLoading(true);
        const clienteSelecionado = listaClientes.find(c => c.codigo === selectedCliente);
        if (!clienteSelecionado) {
            Alert.alert('Erro', 'Cliente selecionado não encontrado.');
            setLoading(false);
            return;
        }
        const vendaData = {
            codCliente: selectedCliente,
            nomeCliente: clienteSelecionado.nome,
            CodFormadePagamento: selectedForma,
            CodCondicaoPagamento: selectedCondicao,
            valorProdutos: subtotal,
            desconto: parseFloat(desconto.replace(',', '.')) || 0,
            valorTotaldeVenda: valorTotalFinal,
            itens: itensVenda,
        };
        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/createvenda', {
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
            router.back();
        } catch (error) {
            Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    let pickerFontSize = 16;
    if (width < 400) pickerFontSize = 14;
    if (width < 350) pickerFontSize = 12;
    const styles = getDynamicStyles(pickerFontSize, width);

    const renderItemVenda = useCallback(({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.nomeProduto}</Text>
                <Text style={styles.itemPrice}>R$ {item.precoUnitario.toFixed(2)} / unidade</Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity style={styles.quantityButton} onPress={() => handleAjustarQuantidade(item.codProduto, -1)}>
                    <Ionicons name="remove-circle" size={28} color={COLORS.danger} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantidade}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={() => handleAjustarQuantidade(item.codProduto, 1)}>
                    <Ionicons name="add-circle" size={28} color={COLORS.success} />
                </TouchableOpacity>
            </View>
        </View>
    ), [handleAjustarQuantidade, styles]);

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>A carregar dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.container}>
                <FlatList
                    ListHeaderComponent={
                        <HeaderComponent
                            listaClientes={listaClientes}
                            listaFormas={listaFormas}
                            listaCondicoes={listaCondicoes}
                            condicoesFiltradas={condicoesFiltradas()}
                            selectedCliente={selectedCliente}
                            setSelectedCliente={setSelectedCliente}
                            selectedForma={selectedForma}
                            setSelectedForma={handleFormaChange}
                            selectedCondicao={selectedCondicao}
                            setSelectedCondicao={setSelectedCondicao}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchFocused={searchFocused}
                            setSearchFocused={setSearchFocused}
                            searchResults={searchResults}
                            handleAdicionarOuAtualizarItem={handleAdicionarOuAtualizarItem}
                            itensVenda={itensVenda}
                            styles={styles}
                            COLORS={COLORS}
                        />
                    }
                    data={itensVenda}
                    renderItem={renderItemVenda}
                    keyExtractor={(item) => item.codProduto.toString()}
                    ListEmptyComponent={<Text style={styles.emptyState}>Nenhum produto adicionado</Text>}
                    ListFooterComponent={
                        <FooterComponent
                            subtotal={subtotal}
                            desconto={desconto}
                            setDesconto={setDesconto}
                            valorTotalFinal={valorTotalFinal}
                            styles={styles}
                            COLORS={COLORS}
                        />
                    }
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={10}
                    removeClippedSubviews={true}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
                />
                <View style={styles.footerContainer}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.back()} disabled={loading}>
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.primaryButton, (itensVenda.length === 0 || loading) && styles.disabledButton]} onPress={handleSalvar} disabled={itensVenda.length === 0 || loading}>
                            {loading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.buttonText}>Finalizar Venda</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default CadastroVenda;
