import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo
} from 'react';
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
    RefreshControl,
} from 'react-native';
import {
    useRouter
} from "expo-router";
import {
    Picker
} from '@react-native-picker/picker';
import {
    Ionicons
} from '@expo/vector-icons';
import {
    LinearGradient
} from 'expo-linear-gradient';

// Configurações da API centralizadas
const API_CONFIG = {
    BASE_URL: 'https://backend-do-controle-de-estoque.onrender.com',
    ENDPOINTS: {
        CLIENTES: '/listclientes',
        FORMAS: '/listformas',
        CONDICOES: '/listcondicoes',
        PRODUTOS: '/listprodutos',
        CREATE_VENDA: '/createvenda',
        CREATE_VENDA_ITENS: '/createitensvenda', // Endpoint para os itens
    },
};

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
    muted: '#6B7280',
};

// Hook customizado para debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook customizado para cálculos de venda
const useVendaCalculations = (itensVenda, desconto) => {
    return useMemo(() => {
        const subtotal = itensVenda.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0);
        const descPercentual = parseFloat(desconto.replace(',', '.')) || 0;
        const valorDesconto = subtotal * (descPercentual / 100);
        const valorTotalFinal = Math.max(0, subtotal - valorDesconto);

        return {
            subtotal,
            valorDesconto,
            valorTotalFinal
        };
    }, [itensVenda, desconto]);
};

const getDynamicStyles = (pickerFontSize, screenWidth) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
        marginBottom: -20,
    },
    headerContent: {
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.white,
        textAlign: 'center',
    },
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.cardShadow,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionIcon: {
        marginRight: 12,
        padding: 8,
        backgroundColor: COLORS.lighter,
        borderRadius: 8,
        position: 'relative',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.dark,
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    pickerContainer: {
        backgroundColor: COLORS.lighter,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    pickerContainerFocused: {
        borderColor: COLORS.primary
    },
    pickerDisabled: {
        backgroundColor: '#E5E7EB',
        opacity: 0.7,
        borderColor: '#D1D5DB',
    },
    picker: {
        height: 56,
        width: '100%',
        fontSize: pickerFontSize,
        color: COLORS.text,
    },
    pickerTextDisabled: {
        color: COLORS.muted
    },
    dependencyHint: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginTop: 4,
        marginLeft: 4,
    },
    warningHint: {
        fontSize: 12,
        color: COLORS.warning,
        fontStyle: 'italic',
        marginTop: 4,
        marginLeft: 4,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lighter,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    searchInputFocused: {
        borderColor: COLORS.primary
    },
    searchIcon: {
        marginRight: 12
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        height: '100%',
    },
    searchResults: {
        maxHeight: 200,
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    searchResultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchResultName: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500'
    },
    searchResultPrice: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    emptyState: {
        textAlign: 'center',
        color: COLORS.textLight,
        paddingVertical: 32,
        fontSize: 16,
        fontStyle: 'italic',
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    itemInfo: {
        flex: 1,
        marginRight: 12
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: COLORS.textLight
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lighter,
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        padding: 8,
        borderRadius: 6,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        minWidth: 40,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    summaryCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        minHeight: 44,
    },
    summaryLabel: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500'
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
    },
    descontoInput: {
        borderWidth: 2,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        width: 80,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: COLORS.lighter,
        minHeight: 44,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.dark
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.success,
    },
    footerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    primaryButton: {
        backgroundColor: COLORS.success,
        shadowColor: COLORS.success,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: COLORS.textLight
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
});

// Componente para o resumo da venda
const FooterComponent = React.memo(({
    subtotal,
    desconto,
    setDesconto,
    valorTotalFinal,
    styles,
    COLORS
}) => (
    <View style={styles.summaryCard}>
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
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                maxLength={5}
            />
        </View>
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Final:</Text>
            <Text style={styles.totalValue}>R$ {valorTotalFinal.toFixed(2)}</Text>
        </View>
    </View>
));

// Componente principal
const CadastroVenda = () => {
    const router = useRouter();
    const {
        width
    } = useWindowDimensions();
    const searchInputRef = useRef(null);

    // Estados de controle
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Estados de dados
    const [listaClientes, setListaClientes] = useState([]);
    const [listaFormas, setListaFormas] = useState([]);
    const [listaCondicoes, setListaCondicoes] = useState([]);
    const [listaProdutos, setListaProdutos] = useState([]);

    // Estados de seleção
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedForma, setSelectedForma] = useState('');
    const [selectedCondicao, setSelectedCondicao] = useState('');

    // Estados de venda
    const [itensVenda, setItensVenda] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [desconto, setDesconto] = useState('0');

    // Debounce da busca para melhor performance
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Cálculos da venda usando hook customizado
    const {
        subtotal,
        valorTotalFinal
    } = useVendaCalculations(itensVenda, desconto);

    // Função para buscar dados da API com tratamento de erro melhorado
    const fetchData = useCallback(async () => {
        try {
            const endpoints = [
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTES}`,
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORMAS}`,
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONDICOES}`,
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUTOS}`,
            ];

            const responses = await Promise.all(
                endpoints.map(url => fetch(url))
            );

            // Verificar se todas as respostas foram bem-sucedidas
            const failedRequests = responses.filter(res => !res.ok);
            if (failedRequests.length > 0) {
                throw new Error(`Falha ao buscar dados: ${failedRequests.length} requisições falharam.`);
            }

            const [clientesData, formasData, condicoesData, produtosData] = await Promise.all(
                responses.map(res => res.json())
            );

            // Validar e definir dados com verificação de tipo
            if (Array.isArray(clientesData)) setListaClientes(clientesData);
            else console.warn('Dados de clientes não são um array:', clientesData);

            if (Array.isArray(formasData)) setListaFormas(formasData);
            else console.warn('Dados de formas não são um array:', formasData);

            if (Array.isArray(condicoesData)) setListaCondicoes(condicoesData);
            else console.warn('Dados de condições não são um array:', condicoesData);

            if (Array.isArray(produtosData)) {
                setListaProdutos(produtosData.map(p => ({ ...p,
                    precoDeVenda: Number(p.precoDeVenda) || 0,
                    custoCompra: Number(p.custoCompra) || 0,
                })));
            } else {
                console.warn('Dados de produtos não são um array:', produtosData);
            }
        } catch (error) {
            console.error("Erro detalhado ao buscar dados:", error);
            Alert.alert(
                "Erro de Conexão",
                `Não foi possível carregar os dados necessários.\n\nDetalhes: ${error.message}`,
                [{
                    text: "Tentar Novamente",
                    onPress: fetchData
                }, {
                    text: "Cancelar",
                    style: "cancel"
                }, ]
            );
        } finally {
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Carregar dados iniciais
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Condições filtradas com memoização
    const condicoesFiltradas = useMemo(() => {
        if (!selectedForma || !listaCondicoes.length) return [];
        return listaCondicoes.filter(cond => cond.codPagamento === selectedForma);
    }, [selectedForma, listaCondicoes]);

    // Resetar condição quando forma muda
    useEffect(() => {
        if (selectedCondicao && selectedForma) {
            const condicaoValida = condicoesFiltradas.find(c => c.codigo === selectedCondicao);
            if (!condicaoValida) {
                setSelectedCondicao('');
            }
        }
    }, [selectedForma, selectedCondicao, condicoesFiltradas]);

    // Busca de produtos com debounce
    useEffect(() => {
        if (debouncedSearchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filteredProducts = listaProdutos.filter(p =>
            p.produto && p.produto.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );

        setSearchResults(filteredProducts);
    }, [debouncedSearchQuery, listaProdutos]);

    // Handlers com useCallback para otimização
    const handleFormaChange = useCallback((novaForma) => {
        setSelectedForma(novaForma);
        if (selectedCondicao) {
            setSelectedCondicao('');
        }
    }, [selectedCondicao]);

    const handleAdicionarOuAtualizarItem = useCallback((produtoSelecionado) => {
        if (!produtoSelecionado || !produtoSelecionado.codigo) {
            Alert.alert('Erro', 'Produto inválido selecionado.');
            return;
        }

        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();

        setItensVenda(prevItens => {
            const itemExistente = prevItens.find(item => item.codProduto === produtoSelecionado.codigo);

            if (itemExistente) {
                return prevItens.map(item =>
                    item.codProduto === produtoSelecionado.codigo ?
                    { ...item,
                        quantidade: item.quantidade + 1
                    } :
                    item
                );
            } else {
                return [...prevItens, {
                    codProduto: produtoSelecionado.codigo,
                    nomeProduto: produtoSelecionado.produto,
                    quantidade: 1,
                    precoUnitario: produtoSelecionado.precoDeVenda,
                    custoProduto: produtoSelecionado.custoCompra || 0,
                }, ];
            }
        });
    }, []);

    const handleAjustarQuantidade = useCallback((codProduto, ajuste) => {
        setItensVenda(prevItens =>
            prevItens.map(item =>
                item.codProduto === codProduto ?
                { ...item,
                    quantidade: Math.max(0, item.quantidade + ajuste)
                } :
                item
            ).filter(item => item.quantidade > 0)
        );
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    // Validação melhorada do formulário
    const validateForm = useCallback(() => {
        const errors = [];

        if (!selectedCliente) errors.push('Cliente');
        if (!selectedForma) errors.push('Forma de Pagamento');
        if (!selectedCondicao) errors.push('Condição de Pagamento');
        if (itensVenda.length === 0) errors.push('Pelo menos um item deve ser adicionado');

        if (errors.length > 0) {
            Alert.alert(
                'Validação',
                `Os seguintes campos são obrigatórios:\n\n• ${errors.join('\n• ')}`
            );
            return false;
        }

        return true;
    }, [selectedCliente, selectedForma, selectedCondicao, itensVenda.length]);

    const handleSalvar = useCallback(async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // --- ETAPA 1: CRIAR A VENDA PRINCIPAL ---
            const clienteSelecionado = listaClientes.find(c => c.codigo === selectedCliente);
            if (!clienteSelecionado) {
                throw new Error('Cliente selecionado não encontrado.');
            }

            // Monta o objeto da venda SEM os itens aninhados
            const vendaData = {
                codCliente: selectedCliente,
                nomeCliente: clienteSelecionado.nome,
                CodFormadePagamento: selectedForma,
                CodCondicaoPagamento: selectedCondicao,
                valorProdutos: subtotal,
                desconto: parseFloat(desconto.replace(',', '.')) || 0,
                valorTotaldeVenda: valorTotalFinal,
            };

            // Envia os dados da venda principal para obter o ID
            const vendaResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_VENDA}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(vendaData),
            });

            if (!vendaResponse.ok) {
                const errorData = await vendaResponse.json().catch(() => ({}));
                throw new Error(`Erro ao criar a venda: ${errorData.message || vendaResponse.status}`);
            }

            // Extrai o ID da venda da resposta do backend.
            // **IMPORTANTE**: Ajuste a linha abaixo conforme a resposta REAL da sua API.
            // Ex: se a API retorna { "id": 123 }, está correto. Se retorna { "vendaId": 123 }, mude para `const { vendaId: novaVendaId }`.
            const { codigo: novaVendaId } = await vendaResponse.json();

            if (!novaVendaId) {
                throw new Error('Não foi possível obter o ID da nova venda a partir da resposta da API.');
            }


            // --- ETAPA 2: PREPARAR E ENVIAR OS ITENS DA VENDA ---
            
            // Mapeia os itens do estado `itensVenda` para a estrutura exigida pelo backend
            const itensParaSalvar = itensVenda.map(item => ({
                codVenda: novaVendaId, // Usa o ID obtido na etapa 1
                codProduto: item.codProduto,
                nomeProduto: item.nomeProduto,
                custoProduto: String(item.custoProduto), // Conforme o exemplo, parece ser string
                quantidade: item.quantidade,
                custoUnitariodeVenda: String(item.precoUnitario), // Frontend usa 'precoUnitario'
                desconto: "0", // O desconto global está na venda, não no item (pelo seu UI atual)
                valorTotaldeVenda: String(item.quantidade * item.precoUnitario),
            }));
            
            // Envia o array de itens para o novo endpoint
            const itensResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_VENDA_ITENS}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(itensParaSalvar), // Envia a lista de itens
            });

            if (!itensResponse.ok) {
                const errorData = await itensResponse.json().catch(() => ({}));
                // Se os itens falharem, a venda principal foi criada. Informe o usuário.
                throw new Error(`A venda (ID: ${novaVendaId}) foi criada, mas falhou ao salvar os itens: ${errorData.message || itensResponse.status}`);
            }

            // Se tudo deu certo
            Alert.alert(
                'Sucesso',
                'Venda e seus itens foram registrados com sucesso!',
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error) {
            console.error('Erro detalhado ao salvar venda:', error);
            Alert.alert(
                'Erro',
                `Não foi possível concluir o salvamento da venda.\n\nDetalhes: ${error.message}`
            );
        } finally {
            setLoading(false);
        }
    }, [
        validateForm, 
        listaClientes, 
        selectedCliente, 
        selectedForma, 
        selectedCondicao, 
        subtotal, 
        desconto, 
        valorTotalFinal, 
        itensVenda, 
        router
    ]);

    // Cálculo dinâmico do tamanho da fonte
    const pickerFontSize = useMemo(() => {
        if (width < 350) return 12;
        if (width < 400) return 14;
        return 16;
    }, [width]);

    const styles = useMemo(() => getDynamicStyles(pickerFontSize, width), [pickerFontSize, width]);

    // Renderização otimizada dos itens da venda
    const renderItemVenda = useCallback(({
        item
    }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text
                    style={styles.itemName}
                    numberOfLines={1}
                    accessibilityLabel={`Produto: ${item.nomeProduto}`}
                >
                    {item.nomeProduto}
                </Text>
                <Text
                    style={styles.itemPrice}
                    accessibilityLabel={`Preço unitário: R$ ${item.precoUnitario.toFixed(2)}`}
                >
                    R$ {item.precoUnitario.toFixed(2)} / unidade
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleAjustarQuantidade(item.codProduto, -1)}
                    accessibilityLabel="Diminuir quantidade"
                    accessibilityRole="button"
                >
                    <Ionicons name="remove-circle" size={28} color={COLORS.danger} />
                </TouchableOpacity>
                <Text
                    style={styles.quantityText}
                    accessibilityLabel={`Quantidade: ${item.quantidade}`}
                >
                    {item.quantidade}
                </Text>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleAjustarQuantidade(item.codProduto, 1)}
                    accessibilityLabel="Aumentar quantidade"
                    accessibilityRole="button"
                >
                    <Ionicons name="add-circle" size={28} color={COLORS.success} />
                </TouchableOpacity>
            </View>
        </View>
    ), [handleAjustarQuantidade, styles]);

    // Tela de carregamento inicial
    if (initialLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={{ flex: 1 }}>
                <FlatList
                    ListHeaderComponent={
                        <>
                            <LinearGradient colors={COLORS.gradient} style={styles.headerGradient}>
                                <Text style={styles.headerTitle}>Nova Venda</Text>
                            </LinearGradient>

                            <View style={{ marginTop: -20 }}>
                                {/* Seção de Dados Gerais */}
                                <View style={styles.sectionCard}>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionIcon}>
                                            <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                                        </View>
                                        <Text style={styles.sectionTitle}>Dados Gerais</Text>
                                    </View>
                                    
                                    {/* Cliente */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Cliente *</Text>
                                        <View style={[styles.pickerContainer, selectedCliente && styles.pickerContainerFocused]}>
                                            <Picker
                                                selectedValue={selectedCliente}
                                                onValueChange={setSelectedCliente}
                                                style={styles.picker}
                                                accessibilityLabel="Seleção de cliente"
                                            >
                                                <Picker.Item label="Selecione o cliente..." value="" />
                                                {listaClientes?.map(c => (
                                                    <Picker.Item
                                                        key={c.codigo}
                                                        label={c.nome}
                                                        value={c.codigo}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>

                                    {/* Forma de Pagamento */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Forma de Pagamento *</Text>
                                        <View style={[styles.pickerContainer, selectedForma && styles.pickerContainerFocused]}>
                                            <Picker
                                                selectedValue={selectedForma}
                                                onValueChange={handleFormaChange}
                                                style={styles.picker}
                                                accessibilityLabel="Seleção de forma de pagamento"
                                            >
                                                <Picker.Item label="Selecione a forma..." value="" />
                                                {listaFormas?.map(f => (
                                                    <Picker.Item
                                                        key={f.codigo}
                                                        label={f.nome}
                                                        value={f.codigo}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>

                                    {/* Condição de Pagamento */}
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
                                                style={[styles.picker, !selectedForma && styles.pickerTextDisabled]}
                                                enabled={!!selectedForma}
                                                accessibilityLabel="Seleção de condição de pagamento"
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
                                        {selectedForma && condicoesFiltradas?.length === 0 && (
                                            <Text style={styles.warningHint}>
                                                ⚠️ Nenhuma condição disponível para esta forma de pagamento.
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {/* Seção de Busca de Produtos */}
                                <View style={styles.sectionCard}>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionIcon}>
                                            <Ionicons name="search-outline" size={24} color={COLORS.primary} />
                                        </View>
                                        <Text style={styles.sectionTitle}>Buscar Produtos</Text>
                                    </View>
                                    
                                    <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
                                        <Ionicons
                                            name="search"
                                            size={20}
                                            color={searchFocused ? COLORS.primary : COLORS.textLight}
                                            style={styles.searchIcon}
                                        />
                                        <TextInput
                                            ref={searchInputRef}
                                            placeholder="Digite o nome do produto..."
                                            style={styles.searchInput}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            onFocus={() => setSearchFocused(true)}
                                            onBlur={() => setSearchFocused(false)}
                                            placeholderTextColor={COLORS.textLight}
                                            accessibilityLabel="Campo de busca de produtos"
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
                                                        <Text style={styles.searchResultName}>{item.produto}</Text>
                                                        <Text style={styles.searchResultPrice}>R$ {item.precoDeVenda.toFixed(2)}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                keyExtractor={(item) => item.codigo.toString()}
                                                ListEmptyComponent={
                                                    <Text style={styles.emptyState}>Nenhum produto encontrado</Text>
                                                }
                                                nestedScrollEnabled
                                                getItemLayout={(data, index) => ({
                                                    length: 60,
                                                    offset: 60 * index,
                                                    index,
                                                })}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Header da Lista de Itens */}
                                <View style={[styles.sectionHeader, { marginHorizontal: 16, marginBottom: 12 }]}>
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
                            </View>
                        </>
                    }
                    data={itensVenda}
                    renderItem={renderItemVenda}
                    keyExtractor={(item) => item.codProduto.toString()}
                    ListEmptyComponent={
                        <View style={styles.sectionCard}>
                            <Text style={styles.emptyState}>Nenhum produto adicionado</Text>
                        </View>
                    }
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
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    getItemLayout={(data, index) => ({
                        length: 80,
                        offset: 80 * index,
                        index,
                    })}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={10}
                />
            </View>
            
            {/* Footer com botões */}
            <View style={styles.footerContainer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => router.back()}
                        disabled={loading}
                        accessibilityLabel="Cancelar cadastro de venda"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.primaryButton,
                            (itensVenda.length === 0 || loading) && styles.disabledButton,
                        ]}
                        onPress={handleSalvar}
                        disabled={itensVenda.length === 0 || loading}
                        accessibilityLabel="Finalizar venda"
                        accessibilityRole="button"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Finalizar Venda</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default CadastroVenda;