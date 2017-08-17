const PAGES = {
            tr:{
                contact_me: 'İletişime geç...!'
            },
            en:{
                contact_me: 'Contact me...!'
            }
        }

window.addEventListener('load', function(){
	window.app = new Vue({
		el: '#app',
        data: {     
            hello: [
                'Hallo',
                'Здравствуйте',
                'Hello',
                'Merhaba',
                'नमस्ते',
                '¡Hola!',
                'Ciao!',
                'Olá!',
                'こんにちは！',
                '你好！',
                'Привіт!',
                'مرحبا!'    ,
                'Salam!',
                'Salut!',
                'Bună!',
                'سلام!',
            ],
            indexHelloText: 0,
            helloText: '',
            timer: '',
            interval: 4000,
            random: '',
            isLoading: false,
            scrollToTopButton: false,
            isActive: 'profile',
            titleName: this.isActive,
            tabs: [
                'me', 
                'profile', 
                'links'
            ],
            scroll: {
                x: 0,
                y: 0
            },
            pages: PAGES,
            routes: [],
            locale: [],
            languages: [
                'tr', 'en', 'de', 'es', 'ru', 'cn', 'ja', 'pt', 'fr', 'it', 'ar'
            ],
            language: '',
        },
		created() {

            var _self = this;

            window.onscroll     = function(event){ _self.onScroll(event); }
            window.onhashchange = function(event){ _self.scrollToTop(); _self.hashChanged(event); }

            /* window.setTimeout(function(){
                _self.isLoading = false;
            }, 1000);*/

            this.random = Math.floor(Math.random() * 2) + 1;

            this.randomHelloText();

            this.timer = setInterval(this.randomHelloText, this.interval);

            this.pageInit();

            this.initPageTab(_self.isActive);


		},
		computed: { },
		methods: {

            randomHelloText() {

                var helloTextArray = this.hello;

                //var helloText = helloTextArray[Math.floor(Math.random() * helloTextArray.length)];

                if(this.indexHelloText < helloTextArray.length){
                    //
                }else{
                    this.indexHelloText = 0;
                }

                var helloText   = helloTextArray[this.indexHelloText];
                this.helloText  = helloText;

                this.indexHelloText++

                return helloText;                            

            },

            backgrnd(){
                return '-webkit-linear-gradient(60deg, rgba(45, 0, 0, 0.5) 5%, rgba(0, 0, 0, 0.45)), url(./img/backgrounds/' + this.random + '.jpg) !important';
            },

            backgrndPos() {
                var tabs        = this.tabs,
                    isActive    = this.isActive;

                switch(isActive){
                    case tabs[0]: return '20% 50%';
                    break;
                    case tabs[1]: return '50% 50%';
                    break;
                    case tabs[2]: return '80% 50%';
                    break;
                    default: return '50% 50%';
                    break;
                }
            },

            pageInit() {
                var _locale     =  navigator.languages && navigator.languages[0] || // Chrome / Firefox
                navigator.language ||   // All browsers
                navigator.userLanguage; // IE <= 10

                var _locale     = _locale.split('-');
                var _language   = _locale[0];

                var _routes     = window.location.hash.split('/');

                this.locale     = _locale,
                this.language   = _language,
                this.routes     = _routes;

                this.setTitleName(_routes[1]);

                // console.log('Initial Variables: ', this.locale, this.language, this.routes);
            },

            setTitleName(val) {

                var val     = (val == undefined) ? "" : val;

                var _head   = "Kazım Anıl AYDIN | [ Think & Do ] | ";
                var title   = _head + val.toUpperCase();

                document.getElementById('title').innerHTML = title;
            },

            onKeyUp(event){

                var keyCode = event.keyCode;

                if(keyCode == 37){

                    this.scrollToTop();
                    return this.prevPage();

                }else if(keyCode == 39){

                    this.scrollToTop();
                    return this.nextPage();

                }

                return false;

            },

            nextPage(){
                
                var _tab        = this.routes[1],
                    tabs        = this.tabs;

                var index       = tabs.indexOf(_tab);

                var _nextPageId = '';
                
                index++;

                if(tabs[index] == undefined){
                    _nextPageId = index - 1;
                }else{
                    _nextPageId = index;
                }

                this.setTab(tabs[_nextPageId]);

            },

            prevPage(){
                var _tab        = this.routes[1],
                    tabs        = this.tabs;

                var index       = tabs.indexOf(_tab);

                var _prevPageId = '';
                
                index--;

                if(tabs[index] == undefined){
                    _prevPageId = index + 1;
                }else{
                    _prevPageId = index;
                }

                this.setTab(tabs[_prevPageId]); 
            },

            onScroll(event){        
                this.scroll = {
                    x: window.scrollX,
                    y: window.scrollY
                }

                if(this.scroll.y > 80){
                    this.scrollToTopButton = true;
                }else{
                    this.scrollToTopButton = false;
                }
            },

            scrollToTop(){
                window.scrollTo(0, 0);
            },

            hashChanged(event){
                this.goTab();
            },

			showTab(target) {
				this.isActive = target;
			},

            goTab() {

                this.pageInit();

                var _tabs       = this.tabs,
                    location    = this.routes,
                    targetTab   = location[1];  

                // console.log('Hash Changed: ', location);

                this.setTab(targetTab);
                          
            },

            setTab(target){

                var _tabs = this.tabs;

                if(!_tabs.includes(target)) { 

                    // console.log('Redirecting: [ PAGE NOT FOUND ]'); 
                    this.initPageTab('profile'); 
                    return false;
                }

                this.isActive = target;
                window.location.hash = "#!/" + target + "/" + this.language;
            },

            initPageTab(target){

                this.pageInit();

                var _tabs       = this.tabs,
                    location    = this.routes,
                    targetTab   = location[1];
                
                if(targetTab == target){
                    this.setTab(target);
                }else{
                    this.setTab(target);
                }

            },

            linkTo(target) {

                return '#!/' + target + '/' + this.language;

            }
		},
        beforeDestroy() {
            clearInterval(this.timer);
        }
	});

    window.addEventListener('keyup', function(event){
        app.hello = 'Merhaba!';
        app.onKeyUp(event);
    });
});