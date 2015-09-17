app.config([
  '$urlRouterProvider',
  '$stateProvider',
  '$httpProvider',
  '$locationProvider',  
  function($urlRouterProvider,$stateProvider,$httpProvider,$locationProvider){

   $urlRouterProvider.otherwise('/');
   $stateProvider.state('home',
    {
      url:'/',
      controller: 'IndexController',
      templateUrl: '/views/indexView.html'
    }); 
  }]);

