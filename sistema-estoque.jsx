import React, { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, TrendingDown, Users, Truck, BarChart3, Edit2, Trash2, Search, X, CheckCircle } from 'lucide-react';

// Sistema de Banco de Dados Simples (Persistent Storage)
const DB = {
  get: async (key) => {
    try {
      if (window.storage) {
        const result = await window.storage.get(key);
        return result ? JSON.parse(result.value) : [];
      } else {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      }
    } catch (error) {
      return [];
    }
  },
  set: async (key, value) => {
    try {
      if (window.storage) {
        await window.storage.set(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  },
  add: async (key, item) => {
    const items = await DB.get(key);
    items.push({ ...item, id: Date.now() + Math.random() });
    await DB.set(key, items);
    return items;
  },
  update: async (key, id, updates) => {
    const items = await DB.get(key);
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await DB.set(key, items);
    }
    return items;
  },
  delete: async (key, id) => {
    const items = await DB.get(key);
    const filtered = items.filter(i => i.id !== id);
    await DB.set(key, filtered);
    return filtered;
  }
};

export default function SistemaEstoque() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setClientes(await DB.get('clientes'));
      setFornecedores(await DB.get('fornecedores'));
      setEntradas(await DB.get('entradas'));
      setSaidas(await DB.get('saidas'));
    };
    loadData();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const MenuItem = ({ icon: Icon, label, page, badge }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 relative group ${
        currentPage === page 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
          : 'text-slate-300 hover:bg-slate-800/50'
      }`}
    >
      <Icon size={22} />
      <span className="font-medium tracking-wide">{label}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
      {currentPage === page && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-slide-in">
          <CheckCircle size={20} />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
          <div className="p-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">StockFlow</h1>
                <p className="text-xs text-slate-400 mt-0.5">Controle Inteligente</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-6 overflow-y-auto">
            <MenuItem icon={BarChart3} label="Dashboard" page="dashboard" />
            <MenuItem icon={Users} label="Clientes" page="clientes" badge={clientes.length} />
            <MenuItem icon={Truck} label="Fornecedores" page="fornecedores" badge={fornecedores.length} />
            <MenuItem icon={TrendingDown} label="Saída de Material" page="saidas" />
            <MenuItem icon={TrendingUp} label="Entrada de Material" page="entradas" />
          </nav>

          <div className="p-6 border-t border-slate-800 bg-slate-900/50">
            <div className="text-xs text-slate-500">
              <p>Sistema v1.0</p>
              <p className="mt-1">Dados salvos localmente</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <Dashboard entradas={entradas} saidas={saidas} clientes={clientes} fornecedores={fornecedores} />}
          {currentPage === 'clientes' && <Clientes clientes={clientes} setClientes={setClientes} showNotification={showNotification} />}
          {currentPage === 'fornecedores' && <Fornecedores fornecedores={fornecedores} setFornecedores={setFornecedores} showNotification={showNotification} />}
          {currentPage === 'saidas' && <Saidas saidas={saidas} setSaidas={setSaidas} clientes={clientes} showNotification={showNotification} />}
          {currentPage === 'entradas' && <Entradas entradas={entradas} setEntradas={setEntradas} fornecedores={fornecedores} showNotification={showNotification} />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0f172a;
        }

        ::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}

function Dashboard({ entradas, saidas, clientes, fornecedores }) {
  const totalEntradas = entradas.reduce((acc, e) => acc + (e.quantidade || 0), 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + (s.quantidade || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const valorEntradas = entradas.reduce((acc, e) => acc + ((e.quantidade || 0) * (e.valorUnitario || 0)), 0);
  const valorSaidas = saidas.reduce((acc, s) => acc + ((s.quantidade || 0) * (s.valorUnitario || 0)), 0);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-white mb-1">{value}</h3>
          <p className="text-xs text-white/70">{subtitle}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  );

  const RecentActivity = ({ data, type }) => (
    <div className="space-y-3">
      {data.slice(-5).reverse().map((item, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white">{item.material}</p>
              <p className="text-sm text-slate-400 mt-1">
                {type === 'entrada' ? `Fornecedor: ${item.fornecedor}` : `Cliente: ${item.cliente}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-400">{item.quantidade} un</p>
              <p className="text-xs text-slate-400">{new Date(item.data).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-center text-slate-500 py-8">Nenhuma movimentação registrada</p>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-slate-400">Visão geral do seu controle de estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          title="Total Entradas"
          value={totalEntradas.toLocaleString()}
          subtitle="unidades recebidas"
          color="from-emerald-600 to-emerald-700"
        />
        <StatCard
          icon={TrendingDown}
          title="Total Saídas"
          value={totalSaidas.toLocaleString()}
          subtitle="unidades enviadas"
          color="from-rose-600 to-rose-700"
        />
        <StatCard
          icon={Package}
          title="Saldo Atual"
          value={saldo.toLocaleString()}
          subtitle="unidades em estoque"
          color="from-blue-600 to-blue-700"
        />
        <StatCard
          icon={Users}
          title="Cadastros"
          value={clientes.length + fornecedores.length}
          subtitle={`${clientes.length} clientes, ${fornecedores.length} fornecedores`}
          color="from-purple-600 to-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={24} />
            Movimentação Financeira
          </h3>
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <span className="text-slate-300">Valor Total Entradas</span>
              <span className="text-2xl font-bold text-emerald-400">
                R$ {valorEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/30">
              <span className="text-slate-300">Valor Total Saídas</span>
              <span className="text-2xl font-bold text-rose-400">
                R$ {valorSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <span className="text-slate-300 font-medium">Saldo</span>
              <span className="text-2xl font-bold text-amber-400">
                R$ {(valorEntradas - valorSaidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <BarChart3 className="text-amber-400" size={24} />
            Resumo Geral
          </h3>
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Clientes Cadastrados</span>
              <span className="text-xl font-bold text-white">{clientes.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Fornecedores Cadastrados</span>
              <span className="text-xl font-bold text-white">{fornecedores.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Entradas Registradas</span>
              <span className="text-xl font-bold text-white">{entradas.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Saídas Registradas</span>
              <span className="text-xl font-bold text-white">{saidas.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={24} />
            Últimas Entradas
          </h3>
          <RecentActivity data={entradas} type="entrada" />
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="text-rose-400" size={24} />
            Últimas Saídas
          </h3>
          <RecentActivity data={saidas} type="saida" />
        </div>
      </div>
    </div>
  );
}

function Clientes({ clientes, setClientes, showNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '', endereco: '', cidade: '', estado: ''
  });

  const formatCNPJ = (value) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const updated = await DB.update('clientes', editingId, formData);
      setClientes(updated);
      showNotification('Cliente atualizado com sucesso!');
    } else {
      const added = await DB.add('clientes', formData);
      setClientes(added);
      showNotification('Cliente cadastrado com sucesso!');
    }
    resetForm();
  };

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      const updated = await DB.delete('clientes', id);
      setClientes(updated);
      showNotification('Cliente excluído com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({ cnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '', endereco: '', cidade: '', estado: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredClientes = clientes.filter(c =>
    c.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Clientes
          </h2>
          <p className="text-slate-400">Gerencie seus clientes cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por CNPJ, Razão Social ou Nome Fantasia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.nomeFantasia}
                    onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    maxLength="2"
                    placeholder="UF"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredClientes.map((cliente) => (
          <div key={cliente.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{cliente.razaoSocial}</h3>
                  {cliente.nomeFantasia && (
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                      {cliente.nomeFantasia}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">CNPJ:</span>
                    <p className="text-white font-medium">{formatCNPJ(cliente.cnpj)}</p>
                  </div>
                  {cliente.email && (
                    <div>
                      <span className="text-slate-400">Email:</span>
                      <p className="text-white font-medium">{cliente.email}</p>
                    </div>
                  )}
                  {cliente.telefone && (
                    <div>
                      <span className="text-slate-400">Telefone:</span>
                      <p className="text-white font-medium">{cliente.telefone}</p>
                    </div>
                  )}
                  {cliente.cidade && (
                    <div>
                      <span className="text-slate-400">Cidade:</span>
                      <p className="text-white font-medium">{cliente.cidade}/{cliente.estado}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(cliente)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredClientes.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Fornecedores({ fornecedores, setFornecedores, showNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '', endereco: '', cidade: '', estado: ''
  });

  const formatCNPJ = (value) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const updated = await DB.update('fornecedores', editingId, formData);
      setFornecedores(updated);
      showNotification('Fornecedor atualizado com sucesso!');
    } else {
      const added = await DB.add('fornecedores', formData);
      setFornecedores(added);
      showNotification('Fornecedor cadastrado com sucesso!');
    }
    resetForm();
  };

  const handleEdit = (fornecedor) => {
    setFormData(fornecedor);
    setEditingId(fornecedor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este fornecedor?')) {
      const updated = await DB.delete('fornecedores', id);
      setFornecedores(updated);
      showNotification('Fornecedor excluído com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({ cnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '', endereco: '', cidade: '', estado: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredFornecedores = fornecedores.filter(f =>
    f.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Fornecedores
          </h2>
          <p className="text-slate-400">Gerencie seus fornecedores cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={20} />
          Novo Fornecedor
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por CNPJ, Razão Social ou Nome Fantasia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.nomeFantasia}
                    onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    maxLength="2"
                    placeholder="UF"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredFornecedores.map((fornecedor) => (
          <div key={fornecedor.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{fornecedor.razaoSocial}</h3>
                  {fornecedor.nomeFantasia && (
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                      {fornecedor.nomeFantasia}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">CNPJ:</span>
                    <p className="text-white font-medium">{formatCNPJ(fornecedor.cnpj)}</p>
                  </div>
                  {fornecedor.email && (
                    <div>
                      <span className="text-slate-400">Email:</span>
                      <p className="text-white font-medium">{fornecedor.email}</p>
                    </div>
                  )}
                  {fornecedor.telefone && (
                    <div>
                      <span className="text-slate-400">Telefone:</span>
                      <p className="text-white font-medium">{fornecedor.telefone}</p>
                    </div>
                  )}
                  {fornecedor.cidade && (
                    <div>
                      <span className="text-slate-400">Cidade:</span>
                      <p className="text-white font-medium">{fornecedor.cidade}/{fornecedor.estado}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(fornecedor)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(fornecedor.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredFornecedores.length === 0 && (
          <div className="text-center py-12">
            <Truck size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum fornecedor encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Saidas({ saidas, setSaidas, clientes, showNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cliente: '', material: '', quantidade: '', valorUnitario: '', data: new Date().toISOString().split('T')[0], observacoes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const added = await DB.add('saidas', { ...formData, quantidade: Number(formData.quantidade), valorUnitario: Number(formData.valorUnitario) });
    setSaidas(added);
    showNotification('Saída registrada com sucesso!');
    resetForm();
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir esta saída?')) {
      const updated = await DB.delete('saidas', id);
      setSaidas(updated);
      showNotification('Saída excluída com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({ cliente: '', material: '', quantidade: '', valorUnitario: '', data: new Date().toISOString().split('T')[0], observacoes: '' });
    setShowForm(false);
  };

  const filteredSaidas = saidas.filter(s =>
    s.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.material?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
            Saída de Material
          </h2>
          <p className="text-slate-400">Registre as saídas de material para clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={20} />
          Nova Saída
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente ou material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Registrar Saída</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cliente *</label>
                <select
                  required
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.razaoSocial}>{c.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Material *</label>
                <input
                  type="text"
                  required
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    min="0"
                    step="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    value={formData.valorUnitario}
                    onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows="3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-rose-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Registrar Saída
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredSaidas.map((saida) => (
          <div key={saida.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-rose-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="text-rose-400" size={24} />
                  <h3 className="text-xl font-bold text-white">{saida.material}</h3>
                  <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-sm font-medium">
                    {saida.quantidade} unidades
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Cliente:</span>
                    <p className="text-white font-medium">{saida.cliente}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Data:</span>
                    <p className="text-white font-medium">{new Date(saida.data).toLocaleDateString()}</p>
                  </div>
                  {saida.valorUnitario > 0 && (
                    <div>
                      <span className="text-slate-400">Valor Total:</span>
                      <p className="text-white font-medium">
                        R$ {(saida.quantidade * saida.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
                {saida.observacoes && (
                  <p className="text-slate-400 text-sm mt-2">{saida.observacoes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(saida.id)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all ml-4"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredSaidas.length === 0 && (
          <div className="text-center py-12">
            <TrendingDown size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhuma saída registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Entradas({ entradas, setEntradas, fornecedores, showNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fornecedor: '', material: '', quantidade: '', valorUnitario: '', data: new Date().toISOString().split('T')[0], observacoes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const added = await DB.add('entradas', { ...formData, quantidade: Number(formData.quantidade), valorUnitario: Number(formData.valorUnitario) });
    setEntradas(added);
    showNotification('Entrada registrada com sucesso!');
    resetForm();
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir esta entrada?')) {
      const updated = await DB.delete('entradas', id);
      setEntradas(updated);
      showNotification('Entrada excluída com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({ fornecedor: '', material: '', quantidade: '', valorUnitario: '', data: new Date().toISOString().split('T')[0], observacoes: '' });
    setShowForm(false);
  };

  const filteredEntradas = entradas.filter(e =>
    e.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.material?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Entrada de Material
          </h2>
          <p className="text-slate-400">Registre as entradas de material de fornecedores</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={20} />
          Nova Entrada
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por fornecedor ou material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Registrar Entrada</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fornecedor *</label>
                <select
                  required
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.razaoSocial}>{f.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Material *</label>
                <input
                  type="text"
                  required
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    min="0"
                    step="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    value={formData.valorUnitario}
                    onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows="3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Registrar Entrada
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredEntradas.map((entrada) => (
          <div key={entrada.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-emerald-400" size={24} />
                  <h3 className="text-xl font-bold text-white">{entrada.material}</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {entrada.quantidade} unidades
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Fornecedor:</span>
                    <p className="text-white font-medium">{entrada.fornecedor}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Data:</span>
                    <p className="text-white font-medium">{new Date(entrada.data).toLocaleDateString()}</p>
                  </div>
                  {entrada.valorUnitario > 0 && (
                    <div>
                      <span className="text-slate-400">Valor Total:</span>
                      <p className="text-white font-medium">
                        R$ {(entrada.quantidade * entrada.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
                {entrada.observacoes && (
                  <p className="text-slate-400 text-sm mt-2">{entrada.observacoes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(entrada.id)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all ml-4"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredEntradas.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhuma entrada registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
