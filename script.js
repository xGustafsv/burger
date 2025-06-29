let carrinho = [];
let quantidades = {};

function alterarQuantidade(produto, delta) {
  if (!quantidades[produto]) quantidades[produto] = 0;
  quantidades[produto] = Math.max(0, quantidades[produto] + delta);
  document.getElementById(`qtd-${produto}`).textContent = quantidades[produto];
}

function adicionarAoCarrinho(produto, preco, categoria) {
  const quantidade = quantidades[produto] || 0;
  if (quantidade === 0) {
    mostrarToast('Selecione a quantidade primeiro!', 'error');
    return;
  }
  
  for (let i = 0; i < quantidade; i++) {
    carrinho.push({ produto, preco, categoria });
  }
  
  quantidades[produto] = 0;
  document.getElementById(`qtd-${produto}`).textContent = 0;
  
  atualizarCarrinho();
  mostrarToast(`${quantidade}x ${produto} adicionado ao carrinho!`);
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
  mostrarToast('Item removido do carrinho');
}

function atualizarCarrinho() {
  const carrinhoVazio = document.getElementById('carrinho-vazio');
  const carrinhoItens = document.getElementById('carrinho-itens');
  const totalContainer = document.getElementById('total-container');
  const totalElement = document.getElementById('total');
  
  if (carrinho.length === 0) {
    carrinhoVazio.classList.remove('hidden');
    carrinhoItens.innerHTML = '';
    totalContainer.classList.add('hidden');
    return;
  }
  
  carrinhoVazio.classList.add('hidden');
  totalContainer.classList.remove('hidden');
  
  // Agrupar itens iguais
  const itensAgrupados = {};
  carrinho.forEach(item => {
    if (itensAgrupados[item.produto]) {
      itensAgrupados[item.produto].quantidade++;
    } else {
      itensAgrupados[item.produto] = {
        ...item,
        quantidade: 1
      };
    }
  });
  
  carrinhoItens.innerHTML = '';
  let total = 0;
  
  Object.values(itensAgrupados).forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'carrinho-item';
    itemElement.innerHTML = `
      <div>
        <strong>${item.produto}</strong> (${item.quantidade}x)
        <br><small>${item.categoria}</small>
      </div>
      <div>
        <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        <button class="btn-remover" onclick="removerProdutoCompleto('${item.produto}')">Remover</button>
      </div>
    `;
    carrinhoItens.appendChild(itemElement);
    total += item.preco * item.quantidade;
  });
  
  totalElement.textContent = total.toFixed(2).replace('.', ',');
}

function removerProdutoCompleto(produto) {
  carrinho = carrinho.filter(item => item.produto !== produto);
  atualizarCarrinho();
  mostrarToast('Produto removido do carrinho');
}

function selecionarPagamento(tipo) {
  // Remove seleção anterior
  document.querySelectorAll('.pagamento-opcao').forEach(opcao => {
    opcao.classList.remove('selecionado');
  });
  
  // Adiciona seleção atual
  event.currentTarget.classList.add('selecionado');
  document.getElementById(tipo).checked = true;
  
  // Mostra/esconde campo de troco
  const trocoContainer = document.getElementById('troco-container');
  if (tipo === 'dinheiro') {
    trocoContainer.classList.remove('hidden');
  } else {
    trocoContainer.classList.add('hidden');
  }
}

function mostrarToast(mensagem, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  
  if (tipo === 'error') {
    toast.style.background = '#e74c3c';
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function validarFormulario() {
  const campos = ['nome', 'telefone', 'cep', 'rua', 'numero', 'bairro', 'cidade'];
  
  for (let campo of campos) {
    const elemento = document.getElementById(campo);
    if (!elemento.value.trim()) {
      mostrarToast(`Por favor, preencha o campo ${elemento.previousElementSibling.textContent}`, 'error');
      elemento.focus();
      return false;
    }
  }
  
  const pagamento = document.querySelector('input[name="pagamento"]:checked');
  if (!pagamento) {
    mostrarToast('Por favor, selecione uma forma de pagamento', 'error');
    return false;
  }
  
  if (carrinho.length === 0) {
    mostrarToast('Adicione pelo menos um item ao carrinho', 'error');
    return false;
  }
  
  return true;
}

function finalizarPedido() {
  if (!validarFormulario()) return;
  
  // Coletar dados do formulário
  const dadosCliente = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    cep: document.getElementById('cep').value,
    rua: document.getElementById('rua').value,
    numero: document.getElementById('numero').value,
    bairro: document.getElementById('bairro').value,
    cidade: document.getElementById('cidade').value,
    complemento: document.getElementById('complemento').value,
    pagamento: document.querySelector('input[name="pagamento"]:checked').value,
    troco: document.getElementById('troco').value,
    observacoes: document.getElementById('observacoes').value
  };
  
  // Gerar relatório do pedido
  let mensagem = `🍔 *PEDIDO - HAMBURGUERIA DO ZÉ*%0A%0A`;
  
  // Dados do cliente
  mensagem += `👤 *CLIENTE:*%0A`;
  mensagem += `Nome: ${dadosCliente.nome}%0A`;
  mensagem += `Telefone: ${dadosCliente.telefone}%0A%0A`;
  
  // Endereço
  mensagem += `📍 *ENDEREÇO DE ENTREGA:*%0A`;
  mensagem += `${dadosCliente.rua}, ${dadosCliente.numero}%0A`;
  if (dadosCliente.complemento) mensagem += `${dadosCliente.complemento}%0A`;
  mensagem += `${dadosCliente.bairro} - ${dadosCliente.cidade}%0A`;
  mensagem += `CEP: ${dadosCliente.cep}%0A%0A`;
  
  // Itens do pedido
  mensagem += `🛒 *PEDIDO:*%0A`;
  const itensAgrupados = {};
  carrinho.forEach(item => {
    if (itensAgrupados[item.produto]) {
      itensAgrupados[item.produto].quantidade++;
    } else {
      itensAgrupados[item.produto] = { ...item, quantidade: 1 };
    }
  });
  
  let total = 0;
  Object.values(itensAgrupados).forEach(item => {
    const subtotal = item.preco * item.quantidade;
    mensagem += `${item.quantidade}x ${item.produto} - R$ ${subtotal.toFixed(2)}%0A`;
    total += subtotal;
  });
  
  mensagem += `%0A💰 *TOTAL: R$ ${total.toFixed(2)}*%0A%0A`;
  
  // Forma de pagamento
  mensagem += `💳 *PAGAMENTO:*%0A`;
  const formasPagamento = {
    'dinheiro': '💵 Dinheiro',
    'cartao-debito': '💳 Cartão de Débito',
    'cartao-credito': '💳 Cartão de Crédito',
    'pix': '📱 PIX'
  };
  mensagem += `${formasPagamento[dadosCliente.pagamento]}%0A`;
  
  if (dadosCliente.pagamento === 'dinheiro' && dadosCliente.troco) {
    const troco = parseFloat(dadosCliente.troco) - total;
    if (troco > 0) {
      mensagem += `Troco para: R$ ${parseFloat(dadosCliente.troco).toFixed(2)}%0A`;
      mensagem += `Troco: R$ ${troco.toFixed(2)}%0A`;
    }
  }
  
  // Observações
  if (dadosCliente.observacoes) {
    mensagem += `%0A📝 *OBSERVAÇÕES:*%0A${dadosCliente.observacoes}%0A`;
  }
  
  // Abrir WhatsApp
  const numeroWhatsApp = '554599432205'; // Substitua pelo número real
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
  
  window.open(urlWhatsApp, '_blank');
  
  mostrarToast('Redirecionando para o WhatsApp...');
}