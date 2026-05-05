// Configuración
const WP_NUMBER = '34600751694';
const ADMIN_PASS = 'SorayaAdmin2026';

let state = {
    products: [
        {id:1, n:"Lattafa Khamrah", pr:"45.00", c:"perfume", img:"https://fimgs.net/images/perfume/nd.75805.jpg", stock:true},
        {id:2, n:"Lattafa Yara", pr:"32.00", c:"perfume", img:"https://fimgs.net/images/perfume/nd.79284.jpg", stock:true}
    ],
    cart: []
};

function render(filter = 'todos') {
    const grid = document.getElementById('grid');
    const filtered = filter === 'todos' ? state.products : state.products.filter(p => p.c === filter);
    
    grid.innerHTML = filtered.map(p => `
        <div class="pc">
            <div class="piw"><img src="${p.img}"></div>
            <h4 class="text-xs font-bold mt-2">${p.n}</h4>
            <div class="flex justify-between items-center mt-2">
                <span class="text-rosa2 font-bold">${p.pr}€</span>
                <button onclick="addCart(${p.id})" class="bg-rosa1 text-white text-[10px] px-2 py-1 rounded-full">Añadir</button>
            </div>
        </div>
    `).join('');
}

function addCart(id) {
    const prod = state.products.find(p => p.id === id);
    state.cart.push(prod);
    document.getElementById('cb').textContent = state.cart.length;
    document.getElementById('wab').textContent = state.cart.length;
    document.getElementById('cb').style.display = 'flex';
    document.getElementById('wab').style.display = 'flex';
    alert("¡Añadido al carrito! 🌸");
}

function irWhatsAppDirecto() {
    if(state.cart.length === 0) {
        window.open(`https://wa.me/${WP_NUMBER}`, '_blank');
    } else {
        let text = "¡Hola Soraya! Me interesan estos productos:\n\n" + state.cart.map(p => "- " + p.n).join("\n");
        window.open(`https://wa.me/${WP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    }
}

function openLogin() { document.getElementById('m-login').style.display = 'flex'; }
function doLogin() {
    if(document.getElementById('apass').value === ADMIN_PASS) {
        document.getElementById('m-login').style.display = 'none';
        document.getElementById('m-admin').style.display = 'flex';
    } else { alert("Error"); }
}

// Carga inicial
window.onload = () => render();
