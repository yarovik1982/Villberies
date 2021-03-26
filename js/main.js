const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});
// cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');// variable can be deleted
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const showAccessories = document.querySelectorAll('.show-accessories');
const showClothing = document.querySelectorAll('.show-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const buttonClear = document.querySelector('.button-clear');

const checkGoods = () =>{ 
	const data = [];

		return async () => {           /* async funcnion дает указание на выполнение 
	функции после того как будет выполнена часть выражения находящаяся справа от ключевого слова 
	await */	
			if (data.length) return data;
	const result = await fetch('db/db.json');
			if (!result.ok) {
		throw 'Ошибочка вышла' + result.status;
	} 
		data.push(...(await result.json()));
	return data;
};
};

const getGoods = checkGoods()

const cart = {
	cartGoods: [],
	countQuantity(){
		cartCount.textContent = this.cartGoods.reduce((sum, item) => {
			return sum + item.count;
		}, 0)
	},
	clearCart() {
		this.cartGoods.length = 0;
		this.countQuantity();
		this.renderCard();
	},
	renderCard(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({id, name, price, count})=>{
			const trGood = document.createElement('tr');// Создаем элемент
			trGood.className = 'cart-item';             // Добавляем класс элементу
			trGood.setAttribute.id = id;                // Добавляем атрибут id элементу

			trGood.innerHTML = `
					<td>${name}</td>
					<td>${price}$</td>
					<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
					<td>${count}</td>
					<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
					<td>${price * count}$</td>
					<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum, item) =>{
			return sum + (item.price * item.count);
		}, 0);
		cardTableTotal.textContent = totalPrice + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCard();
		this.countQuantity();
	},
	minusGood(id){
		for (const item of this.cartGoods){
			if (item.id === id){
				if (item.count <= 1){
					this.deleteGood(id);
				} else {
					item.count--;
				}
				break;
			};
		}
		this.renderCard();
		this.countQuantity();
	},
	plusGood(id){
		for (const item of this.cartGoods){
			if (item.id === id){
				item.count++;
				break;
			};
		}
		this.renderCard();
		this.countQuantity();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
			if (goodItem) {
				this.plusGood(id);
			} else {
				getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({id, name, price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1,
					});
					this.countQuantity();
				});
			}
	},
};

buttonClear.addEventListener('click', cart.clearCart.bind(cart));

document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
		if (addToCart) {
			cart.addCartGoods(addToCart.dataset.id)
		}
})

cartTableGoods.addEventListener('click', event =>{
	const target = event.target;
	if (target.classList.contains('cart-btn-delete')) {
		// const parent = target.closest('.cart-item'); // находим класс у родителя(если класса нет, поднимается выше)
		// console.log(parent.dataset.id);
		cart.deleteGood(target.dataset.id);
	};
	if (target.classList.contains('cart-btn-minus')){
		cart.minusGood(target.dataset.id)
	};
	if (target.classList.contains('cart-btn-plus')){
		cart.plusGood(target.dataset.id)
	};
})

const openModal = ()=> {
	cart.renderCard();
	// console.log(cart);
	modalCart.classList.add('show');
}

const closeModal = ()=> {
	modalCart.classList.remove('show');
}
buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', function(event){
	const target = event.target;
	if(target.classList.contains('overlay') || target.classList.contains('modal-close') && !target.classList.contains('cart-buy')){
		closeModal();
	}
})

//  scroll smooth

function scroll(){ 
	const scrollLinks = document.querySelectorAll('a.scroll-link');
	
	for(let scrollLink of scrollLinks){
		scrollLink.addEventListener('click', event=>{
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior : 'smooth',
				block : 'start',
		})
	});
}
};
scroll();

//  goods

const createCard = function({label, img, name, description, id, price}){
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
		
	card.innerHTML = `
		<div class="goods-card">
		${label ? `<span class="label">${label}</span>` : ''}		
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$ ${price}</span>
			</button>
		</div>`;

	return card;
};

const renderCard = function(data){
	longGoodsList.textContent = '';
	const cards = data.map(createCard)
	longGoodsList.append(...cards);
		document.body.classList.add('show-goods');
};

const showAll = function(event){
	event.preventDefault();
	getGoods().then(renderCard);
}
viewAll.forEach(elem => {
	elem.addEventListener('click', showAll);
});

const filterCards = function(field, value){
	getGoods()
	.then(data => data.filter(good => good[field] === value))
	.then(renderCard);
};

navigationLink.forEach(function(link){
	link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
	})
});

showAccessories.forEach(item =>{
	item.addEventListener('click', event =>{
		event.preventDefault();
		filterCards('categories', 'Accessories');
	});
});
showClothing.forEach(item =>{
	item.addEventListener('click', event =>{
		event.preventDefault();
		filterCards('categories', 'Clothing');
	});
});

const modalForm = document.querySelector('.modal-form');
const _error = document.querySelector('.error');
// const postData = dataUser => fetch('server.php', {
// 	method: 'POST',
// 	body: dataUser,
// });

modalForm.addEventListener('submit', event => {
	event.preventDefault();
	_error.classList.add('active');
	// const formData = new FormData(modalForm);
	// formData.append('cart', JSON.stringify(cart.cartGoods))
	// .then(response => {
	// 		if (!response.ok){
	// 			throw new Error(response.status);
	// 		}
	// 		alert('Ваш заказ отправлен, с вами свяжутся в ближайшее время.');
	// 	})
	// 	.cetch(error => {
	// 		alert('К сожалению произошла ошибка, повторите позже.');
	// 	})
		// .finally(() => {
			closeModal();
			modalForm.reset();
			cart.cartGoods.length = 0;
			cartCount.innerHTML = "";
			// alert('Ваш заказ отправлен, с вами свяжутся в ближайшее время.');
		// });

	// postData(formData);
	
});
