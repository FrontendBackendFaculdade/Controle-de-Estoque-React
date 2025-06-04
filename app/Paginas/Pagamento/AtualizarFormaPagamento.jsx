import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    TouchableOpacity,
    // ActivityIndicator, // Mantido se desejar adicionar indicador de carregamento inicial da lista
    Alert
} from 'react-native';
import {useRouter} from "expo-router";
import {Picker} from '@react-native-picker/picker';

// Espera a propriedade nomeToUpdate se um método de pagamento específico deve ser pré-selecionado pelo nome
const AtualizarPagamento = ({nomeToUpdate}) => {
    const router = useRouter();

    const [nome, setNome] = useState(''); // Armazena o nome do método de pagamento selecionado
    const [ativo, setAtivo] = useState(''); // Armazena o status 'ativo'
    const [codigo, setCodigo] = useState(null); // Armazena o código (inteiro ou null) da forma de pagamento selecionada
    const [loading, setLoading] = useState(false); // Estado para a operação de salvar

    const [formasPagamentoList, setFormasPagamentoList] = useState([]);
    // const [isLoadingInitialList, setIsLoadingInitialList] = useState(true); // Opcional para carregamento inicial da lista

    useEffect(() => {
        const fetchFormasPagamento = async() => {
            // if (setIsLoadingInitialList) setIsLoadingInitialList(true);
            try {
                const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listformas');
                if (!response.ok) {
                    throw new Error('Falha ao buscar formas de pagamento.');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setFormasPagamentoList(data);
                    if (nomeToUpdate) { // Verifica se um nome é fornecido para pré-selecionar
                        const initialForma = data.find(f => f.nome === nomeToUpdate);
                        if (initialForma) {
                            setNome(initialForma.nome);
                            setAtivo(initialForma.situacao);
                            const parsedCodigo = parseInt(initialForma.codigo, 10);
                            setCodigo(isNaN(parsedCodigo) ? null : parsedCodigo); // Armazena o código como inteiro
                        } else {
                            Alert.alert("Atenção", "A forma de pagamento inicial não foi encontrada. Por favor, selecione uma da lista.");
                            setNome(''); // Limpa se não encontrado
                            setAtivo('');
                            setCodigo(null);
                        }
                    } else {
                        // Se não houver nomeToUpdate, garante que os campos estejam limpos para seleção manual
                         setNome('');
                         setAtivo('');
                         setCodigo(null);
                    }
                } else {
                    setFormasPagamentoList([]);
                    setNome('');
                    setAtivo('');
                    setCodigo(null);
                }
            } catch (error) {
                console.error("Erro ao buscar formas de pagamento:", error);
                Alert.alert("Erro", error.message || "Não foi possível carregar as formas de pagamento.");
                setFormasPagamentoList([]);
                setNome('');
                setAtivo('');
                setCodigo(null);
            } finally {
                // if (setIsLoadingInitialList) setIsLoadingInitialList(false);
            }
        };

        fetchFormasPagamento();
    }, [nomeToUpdate]); // O efeito é executado se a propriedade nomeToUpdate mudar

    const handleFormaPagamentoSelection = (selectedNome) => {
        if (selectedNome) { // Verifica se um nome válido é selecionado (não o valor do placeholder)
            const selectedForma = formasPagamentoList.find(f => f.nome === selectedNome);
            if (selectedForma) {
                setNome(selectedForma.nome);
                setAtivo(selectedForma.situacao);
                const parsedCodigo = parseInt(selectedForma.codigo, 10);
                setCodigo(isNaN(parsedCodigo) ? null : parsedCodigo); // Armazena o código como inteiro
            } else {
                // Este caso idealmente não deve ser alcançado se selectedNome vier da lista do picker
                setNome('');
                setAtivo('');
                setCodigo(null);
            }
        } else {
            // Se o placeholder "-- Selecione uma forma --" for selecionado (valor é nulo ou string vazia)
            setNome('');
            setAtivo('');
            setCodigo(null);
        }
    };

    const handleSalvar = async() => {
        if (!nome) { // Verifica se um nome de método de pagamento está selecionado
            Alert.alert('Erro', 'Selecione uma forma de pagamento para atualizar.');
            return;
        }
        if (ativo === '' || ativo === null) { // Verifica se o status 'ativo' está definido
            Alert.alert('Erro', 'A situação da forma de pagamento deve ser definida.');
            return;
        }
        if (codigo === null) { // Verifica se o código (inteiro) está presente
             Alert.alert('Erro', 'O código da forma de pagamento não foi encontrado. Selecione novamente.');
             return;
        }

        setLoading(true);

        const formaPagamentoData = {
            codigo: codigo, // Adiciona o código (inteiro) ao payload
            nome: nome,
            ativo: ativo // No seu código original, 'ativo' era usado no payload, não 'situacao'
        };

        try {
            // O endpoint do backend usa o código para identificar o registro
            const response = await fetch(`https://backend-do-controle-de-estoque.onrender.com/atualizarforma/${encodeURIComponent(String(codigo))}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formaPagamentoData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: 'Erro ao processar a resposta do servidor ou resposta não JSON.'}));
                Alert.alert('Erro ao Atualizar', `Falha ao atualizar forma de pagamento: ${errorData.message || response.status}`);
                return; // Retorna após o alerta em caso de erro
            }

            if (response.status === 204) {
                 Alert.alert('Sucesso', 'Forma de pagamento atualizada com sucesso!');
            } else {
                await response.json();
                Alert.alert('Sucesso', 'Forma de pagamento atualizada com sucesso!');
            }

            if (router.canGoBack()) {
                router.back();
            }
        } catch (error) {
            console.error('Erro em handleSalvar:', error);
            Alert.alert('Erro ao Atualizar', `Ocorreu um erro inesperado: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Atualizar Forma de Pagamento</Text>

            <Text style={styles.label}>Selecione a Forma de Pagamento:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={nome} 
                    onValueChange={(itemValue) => handleFormaPagamentoSelection(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item
                        label="-- Selecione uma forma --"
                        value="" 
                        style={styles.pickerPlaceholderItem}
                    />
                    {formasPagamentoList.map((forma) => (
                        <Picker.Item key={forma.codigo} label={forma.nome} value={forma.nome}/>
                    ))}
                </Picker>
            </View>

            {nome ? ( 
                <>
                    <Text style={styles.label}>Código da Forma Selecionada:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={codigo} // selectedValue pode ser null ou number
                            style={styles.picker}
                            enabled={false} 
                        >
                            {/* O Picker.Item value idealmente deve ser string, mas para display pode ser ok */}
                            <Picker.Item label={codigo !== null ? codigo.toString() : "--"} value={codigo !== null ? codigo : ""} />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Situação da Forma de Pagamento:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={ativo}
                            onValueChange={(itemValue) => setAtivo(itemValue)}
                            style={styles.picker}
                            enabled // Picker de situação é alterável
                        >
                            <Picker.Item
                                label="-- Selecione a situação --"
                                value="" 
                                style={styles.pickerPlaceholderItem}
                            />
                            <Picker.Item label="Ativo" value="Sim"/>
                            <Picker.Item label="Inativo" value="Não"/>
                        </Picker>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title={loading ? "Salvando..." : "Salvar Alterações"}
                            onPress={handleSalvar}
                            color="#007AFF"
                        />
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.label}>Código da Forma Selecionada:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={""} style={styles.picker} enabled={false} >
                            <Picker.Item label="--" value="" />
                        </Picker>
                    </View>
                    <Text style={styles.label}>Situação da Forma de Pagamento:</Text>
                     <View style={styles.pickerContainer}>
                        <Picker selectedValue={""} style={styles.picker} enabled={false} >
                            <Picker.Item label="-- Selecione a situação --" value="" style={styles.pickerPlaceholderItem} />
                        </Picker>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Salvar Alterações"
                            onPress={() => { Alert.alert('Atenção', 'Selecione uma forma de pagamento primeiro.'); }} 
                            color="#007AFF"
                            disabled={true} 
                        />
                    </View>
                </>
            )}

            <TouchableOpacity
                style={styles.backButton} 
                onPress={() => { if (router.canGoBack()) router.back(); }}
            >
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    label: {
        fontSize: 16,
        color: '#333',
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginBottom: 5,
        marginTop: 10
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        justifyContent: 'center'
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
        marginBottom: 20
    },
    backButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
    loader: {
        marginVertical: 20
    },
    disabledButton: { 
        opacity: 0.5
    }
});

export default AtualizarPagamento; // Mantido como AtualizarPagamento conforme o código fornecido
