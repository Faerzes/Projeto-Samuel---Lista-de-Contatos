import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const tiposTelefone = ['Celular', 'Comercial', 'Casa'];

export default function ContactListApp() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoTelefone, setTipoTelefone] = useState('Celular');
  const [email, setEmail] = useState('');
  const [contatos, setContatos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [contatoEditando, setContatoEditando] = useState(null);
  const [confirmacaoVisible, setConfirmacaoVisible] = useState(false);

  useEffect(() => {
    const carregarContatos = async () => {
      try {
        const contatosSalvos = await AsyncStorage.getItem('contatos');
        if (contatosSalvos) {
          setContatos(JSON.parse(contatosSalvos));
        }
      } catch (error) {
        console.error('Erro ao carregar contatos do AsyncStorage:', error);
      }
    };

    carregarContatos();
  }, []);

  const adicionarContato = () => {
    setModalVisible(true);
    setContatoEditando(null);
    setNome('');
    setTelefone('');
    setTipoTelefone('Celular');
    setEmail('');
  };

  const editarContato = (contato) => {
    setModalVisible(true);
    setContatoEditando(contato);
    setNome(contato.nome);
    const [tipo, numero] = contato.telefone.split(':');
    setTipoTelefone(tipo.trim());
    setTelefone(numero.trim());
    setEmail(contato.email || '');
  };

  const excluirContato = (contato) => {
    setConfirmacaoVisible(true);
    setContatoEditando(contato);
  };

  const confirmarExclusao = async () => {
    try {
      const indexContatoExcluir = contatos.findIndex(
        (contato) => contato === contatoEditando
      );
      const novosContatos = [...contatos];
      novosContatos.splice(indexContatoExcluir, 1);
      setContatos(novosContatos);
      await AsyncStorage.setItem('contatos', JSON.stringify(novosContatos));
      setConfirmacaoVisible(false);
    } catch (error) {
      console.error('Erro ao excluir contato do AsyncStorage:', error);
    }
  };

  const cancelarExclusao = () => {
    setConfirmacaoVisible(false);
  };

  const salvarContato = async () => {
    if (!nome && !telefone && !email) {
      setMensagemErro('Insira texto em pelo menos um campo');
      setTimeout(() => {
        setMensagemErro('');
      }, 2000);
      return;
    }

    try {
      const novoContato = { nome, telefone: `${tipoTelefone}: ${telefone}`, email };

      if (contatoEditando) {
        const indexContatoEditando = contatos.findIndex(
          (contato) => contato === contatoEditando
        );
        const novosContatos = [...contatos];
        novosContatos[indexContatoEditando] = novoContato;
        setContatos(novosContatos);
      } else {
        const novosContatos = [...contatos, novoContato];
        setContatos(novosContatos);
      }

      await AsyncStorage.setItem('contatos', JSON.stringify(contatos));
      setModalVisible(false);
      setContatoEditando(null);
    } catch (error) {
      console.error('Erro ao adicionar e salvar no AsyncStorage:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.infoContainer}>
        <Text style={styles.nome}>{item.nome || 'Nome não informado'}</Text>
        <Text style={styles.telefone}>{item.telefone}</Text>
      </View>
      <View style={styles.botoesContainer}>
        <TouchableOpacity onPress={() => editarContato(item)}>
          <Text style={styles.editButton}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => excluirContato(item)}>
          <Ionicons name="trash-outline" size={24} color="#FF6347" style={styles.deleteButton} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const exibirPopupConfirmacao = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmacaoVisible}
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.confirmacaoModal}>
          <View style={styles.confirmacaoContainer}>
            <Text style={styles.confirmacaoTexto}>Apagar contato?</Text>
            <View style={styles.confirmacaoBotoes}>
              <TouchableOpacity onPress={cancelarExclusao}>
                <Text style={[styles.confirmacaoBotao, styles.cancelarBotao]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmarExclusao}>
                <Text style={[styles.confirmacaoBotao, styles.apagarBotao]}>Apagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Contatos</Text>
        <TouchableOpacity style={styles.addButton} onPress={adicionarContato}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={contatos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {contatoEditando ? 'Editar Contato' : 'Adicionar Contato'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome"
              value={nome}
              onChangeText={(text) => setNome(text)}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Telefone"
              keyboardType="numeric"
              value={telefone}
              onChangeText={(text) => setTelefone(text)}
            />

            <Picker
              selectedValue={tipoTelefone}
              onValueChange={(itemValue) => setTipoTelefone(itemValue)}
              style={styles.picker}
            >
              {tiposTelefone.map((tipo, index) => (
                <Picker.Item key={index} label={tipo} value={tipo} />
              ))}
            </Picker>

            <TextInput
              style={styles.modalInput}
              placeholder="E-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButton}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={salvarContato}>
                <Text style={styles.modalButton}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {exibirPopupConfirmacao()}

      {mensagemErro ? (
        <View style={styles.erroContainer}>
          <Text style={styles.erroTexto}>{mensagemErro}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 50,
    padding: 15,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
  },
  item: {
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  nome: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
  telefone: {
    fontSize: 14,
    color: 'gray',
  },
  botoesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    color: '#386641',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#386641',
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    color: 'black',
  },
  confirmacaoModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmacaoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  confirmacaoTexto: {
    color: 'black',
    fontSize: 20,
    marginBottom: 20,
  },
  confirmacaoBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmacaoBotao: {
    color: '#FF6347',
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
  },
  cancelarBotao: {
    backgroundColor: 'black',
    color: 'white',
  },
  apagarBotao: {
    backgroundColor: 'black',
    color: 'white',
  },
  erroContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  erroTexto: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    color: 'white',
  },
});
