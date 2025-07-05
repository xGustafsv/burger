// Objeto para armazenar os itens do carrinho
let cart = {};

// Preços dos itens
const itemPrices = {
    'burger-classico': 25.00,
    'burger-bacon': 32.00,
    'burger-deluxe': 38.00,
    'burger-duplo': 45.00,
    'espeto-carne': 12.00,
    'espeto-frango': 10.00,
    'espeto-linguica': 8.00,
    'espeto-coracaozinho': 9.00,
    'refrigerante': 5.00,
    'agua': 3.00,
    'suco': 7.00
};

// Nomes dos itens
const itemNames = {
    'burger-classico': 'Burger Clássico',
    'burger-bacon': 'Burger Bacon',
    'burger-deluxe': 'Burger Deluxe',
    'burger-duplo': 'Burger Duplo',
    'espeto-carne': 'Espeto de Carne',
    'espeto-frango': 'Espeto de Frango',
    'espeto-linguica': 'Espeto de Linguiça',
    'espeto-coracaozinho': 'Espeto de Coraçãozinho',
    'refrigerante': 'Refrigerante Lata',
    'agua': 'Água Mineral',
    'suco': 'Suco Natural'
};

// Função para alterar quantidade
function changeQuantity(itemId, change) {
    if (!cart[itemId]) {
        cart[itemId] = 0;
    }
    
    cart[itemId] += change;
    
    if (cart[itemId] < 0) {
        cart[itemId] = 0;
    }
    
    if (cart[itemId] === 0) {
        delete cart[itemId];
    }
    
    updateDisplay();
}

// Função para atualizar a exibição
function updateDisplay() {
    // Atualizar contadores
    Object.keys(itemPrices).forEach(itemId => {
        const qtyElement = document.getElementById(`qty-${itemId}`);
        if (qtyElement) qtyElement.textContent = cart[itemId] || 0;
    });
    
    // Atualizar resumo do pedido
    updateOrderSummary();
    
    // Atualizar botão de envio
    updateSubmitButton();
}

// Função para atualizar resumo do pedido
function updateOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const emptyCart = document.getElementById('emptyCart');
    const totalAmount = document.getElementById('totalAmount');
    const totalValue = document.getElementById('totalValue');
    
    summaryItems.innerHTML = '';
    let total = 0;
    let hasItems = false;
    
    Object.keys(cart).forEach(itemId => {
        if (cart[itemId] > 0) {
            hasItems = true;
            const itemTotal = cart[itemId] * itemPrices[itemId];
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
                <span>${cart[itemId]}x ${itemNames[itemId]}</span>
                <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
            `;
            summaryItems.appendChild(itemElement);
        }
    });
    
    if (hasItems) {
        emptyCart.style.display = 'none';
        totalAmount.style.display = 'block';
        totalValue.textContent = total.toFixed(2).replace('.', ',');
    } else {
        emptyCart.style.display = 'block';
        totalAmount.style.display = 'none';
    }
}

// Função para atualizar botão de envio
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const hasItems = Object.keys(cart).some(itemId => cart[itemId] > 0);
    submitBtn.disabled = !hasItems;
}

// Mostrar/esconder campo de troco
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const changeGroup = document.getElementById('changeGroup');
        if (this.value === 'dinheiro') {
            changeGroup.style.display = 'block';
        } else {
            changeGroup.style.display = 'none';
            document.getElementById('changeAmount').value = '';
        }
    });
});

// Função para formatar telefone
document.getElementById('customerPhone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = value;
});

// Função para enviar pedido
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Verificar se há itens no carrinho
    const hasItems = Object.keys(cart).some(itemId => cart[itemId] > 0);
    if (!hasItems) {
        alert('Adicione pelo menos um item ao carrinho!');
        return;
    }
    
    // Coletar dados do formulário
    const formData = new FormData(this);
    const customerName = formData.get('customerName');
    const customerPhone = formData.get('customerPhone');
    const customerAddress = formData.get('customerAddress');
    const paymentMethod = formData.get('paymentMethod');
    const changeAmount = formData.get('changeAmount');
    const observations = formData.get('observations');
    
    // Gerar resumo do pedido
    let orderSummary = `🍔 *NOVO PEDIDO - DELICI'S BURGER & ESPETINHOS*\n\n`;
    orderSummary += `👤 *Cliente:* ${customerName}\n`;
    orderSummary += `📱 *Telefone:* ${customerPhone}\n`;
    orderSummary += `📍 *Endereço:* ${customerAddress}\n\n`;
    
    orderSummary += `🛒 *ITENS DO PEDIDO:*\n`;
    let total = 0;
    
    Object.keys(cart).forEach(itemId => {
        if (cart[itemId] > 0) {
            const itemTotal = cart[itemId] * itemPrices[itemId];
            total += itemTotal;
            orderSummary += `• ${cart[itemId]}x ${itemNames[itemId]} - R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
        }
    });
    
    orderSummary += `\n💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    
    orderSummary += `💳 *Forma de Pagamento:* `;
    switch(paymentMethod) {
        case 'pix':
            orderSummary += `PIX\n`;
            break;
        case 'cartao':
            orderSummary += `Cartão (Débito/Crédito)\n`;
            break;
        case 'dinheiro':
            orderSummary += `Dinheiro`;
            if (changeAmount) {
                orderSummary += ` - Troco para R$ ${parseFloat(changeAmount).toFixed(2).replace('.', ',')}\n`;
            } else {
                orderSummary += `\n`;
            }
            break;
    }
    
    if (observations) {
        orderSummary += `\n📝 *Observações:* ${observations}\n`;
    }
    
    orderSummary += `\n⏰ *Horário do Pedido:* ${new Date().toLocaleString('pt-BR')}`;
    
    // ALTERE ESTE NÚMERO PARA O WhatsApp DA HAMBURGUERIA
    const whatsappNumber = '5511999999999'; // Substitua pelo número correto
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(orderSummary);
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Limpar formulário e carrinho após envio
    setTimeout(() => {
        if (confirm('Pedido enviado! Deseja limpar o carrinho para um novo pedido?')) {
            cart = {};
            updateDisplay();
            document.getElementById('orderForm').reset();
        }
    }, 1000);
});

// Inicializar display
updateDisplay();
