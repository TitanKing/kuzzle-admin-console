angular.module('kuzzle.realtime')

  .controller('WatchDataCtrl', [
    '$scope',
    'collectionApi',
    'documentApi',
    'filter',
    'notification',
    'watchDataForms',
    function ($scope, collectionApi, documentApi, filterTools, notificationTools, watchDataForms) {
    $scope.MAX_LOG_SIZE = 30000;
    $scope.subscribed = false;

    $scope.init = function () {
      $scope.forms = watchDataForms;
      collectionApi.list()
        .then(function (response) {
          $scope.forms.collections = response;
        });
    };

    $scope.basicSubscribe = function () {
      $scope.forms.subscribed = true;
    };

    $scope.subscribe = function () {
      if (!$scope.forms.collection)
        return;

      $scope.subscribed = true;
      var filter = {};
      if ($scope.forms.searchType.basic)
        filter = filterTools.formatBasicFilter($scope.forms.filter.basicFilter);
      else if ($scope.forms.searchType.advanced)
        filter = filterTools.formatAdvancedFilter($scope.forms.filter.advancedFilter);

      $scope.forms.messages.push({
        id: $scope.forms.collection,
        text: "You are now receiving notifications from ",
        icon: "thumbs-up",
        source: angular.toJson(filter, 4),
      });

      $scope.room = documentApi.subscribeFilter($scope.forms.collection, filter, function (notification) {
        var phase;

        addNotification(notification);
        phase = $scope.$root.$$phase;
        if(phase !== '$apply' && phase !== '$digest') {
          $scope.$apply();
        }
      })
    };

    $scope.clearMessages = function () {
      $scope.forms.messages = [];
    }

    $scope.unsubscribe = function () {
      $scope.subscribed = false;
      $scope.room.unsubscribe();

      $scope.forms.messages.push({
        text: "You stopped the current subscription.",
        icon: "thumbs-down"
      });
    };

    $scope.publishMessage = function (message) {
      try {
        documentApi.publishMessage($scope.forms.collection, JSON.parse(message));
        $scope.forms.error = "";
      } catch (e) {
        $scope.forms.error = e.message;
        if (e.lineNumber)
          $scope.forms.error += " on line " + e.lineNumber;
      } finally {

      }
    };

    $scope.onBasicFilterSelected = function () {
      // Eventually put here some code that renders a basic filter structure
      // from an existing advanced filter predicate.
    };

    $scope.onAdvancedFilterSelected = function () {
      if ($scope.forms.advancedSearch && !$scope.forms.advancedSearch.$pristine) {
        return false;
      }

      $scope.forms.filter.advancedFilter = serializeBasicFilter($scope.forms.filter.basicFilter);
    };

    var addNotification = function (notification) {
      try {
        $scope.forms.messages.push(notificationTools.notificationToMessage(notification));

        if ($scope.forms.messages.length > $scope.MAX_LOG_SIZE)
          $scope.forms.messages.shift();
      } catch (e) {
        console.log("Realtime-WatchData: " + e.message);
      } finally {

      }
    };

    var serializeBasicFilter = function (basicFilter) {
      var filter = filterTools.formatBasicFilter(basicFilter);
      filter = {filter: filter};
      return angular.toJson(filter, 4);
    }
  }]);