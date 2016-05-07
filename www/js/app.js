// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngMaterial', 'chart.js', 'angularMoment'])

.config(function($mdIconProvider)
{
  $mdIconProvider.defaultIconSet("svg/mdi.svg");
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller("WaterHistoryController", function($scope, $http, moment, $timeout)
{
  // DeviceID and Config are hardcoded for now
  $scope.deviceId = "571d8bd1e9786ce82788bed2";
	var config = 
  {
    "headers":
    {
      "x-access-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InNhYmVyIiwiaWQiOiI1NzFkNzg2NGY4MWQ4ZjNjMWZhZTFkYmEiLCJpYXQiOjE0NjI1MzE1NzUsImV4cCI6MTQ2MzEzNjM3NSwiaXNzIjoicG9zZWlkb24ifQ.2ldkJGcDOFnRJ9zvP1BIYY4xK0WeTB5QdYeEWhHVbCs"
    }
  };
	var updateTask = null;
  $scope.series = ["Sensor Readings"];
	$scope.getDevice = function()
	{
		$http.get("http://triton145.azurewebsites.net/api/device/" + $scope.deviceId + "?t=" + Date.now().toString(), config)
		.then(function success(res)
		{
			if (updateTask)
			{
				$timeout.cancel(updateTask);
				updateTask = null;
			}
			$scope.device = res.data;
			// Get sensor data
			$scope.levels = [[]];
			$scope.labels = [];
      if (res.data.readings.length > 10)
      {
        res.data.readings.splice(0, res.data.readings.length - 10);
      }
			for(var i = 0; i < res.data.readings.length; i++)
			{
				$scope.levels[0].push(res.data.readings[i].level);
				$scope.labels.push(moment(res.data.readings[i].dateSent).fromNow());
			}
			if ($scope.levels[0].length > 0)
      {
        // Check if stagnant and/or full
        $scope.isStagnant = false;
        $scope.isFull = false;
        var now = new Date();
        var lastEmptied = new Date(res.data.lastEmptied);
        var diff = now.getTime() - lastEmptied.getTime();
        if (diff >= 30000) // 259200000 ms is 3 days
        {
          $scope.isStagnant = true;
        }
        $scope.percentage = 100 * $scope.levels[0][+$scope.levels[0].length - 1] / $scope.device.maxCapacity;
        if ($scope.percentage >= 90)
        {
          $scope.isFull = true;
        }
      }
			// Set timeout for next update 
			var updateTask = $timeout($scope.getDevice, 4000);
		},
		function error(res)
		{
			// DO something on error
		});
	};
	$scope.getDevice(); // Get devices for the first time
});