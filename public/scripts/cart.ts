window.onload = () => {
    console.log(JSON.parse(sessionStorage.getItem('cart')));
    loadCart();
};


function loadCart() {
    const cart = JSON.parse(sessionStorage.getItem('cart'));
    const items = document.getElementById('items') as HTMLDivElement;
    
    for (const key in cart) {
        let card = document.createElement('div');
        card.className = 'panel-content';

        for (const attr in cart[key]) {
            let p = document.createElement('p');
            p.innerText = `${attr}: ${cart[key][attr]}`;
            card.appendChild(p);
        }

        items.appendChild(card);
    }
}
