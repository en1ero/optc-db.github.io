(function () {

//Controllers
  var app = angular.module("optc");

  app.controller(
    "MainCtrl",
    function (
      $scope,
      $rootScope,
      $state,
      $stateParams,
      $timeout,
      $storage,
      $controller
    ) {
      if (!$rootScope.hasOwnProperty("nightMode")) {
        $rootScope.nightMode = $storage.get("chars.night", false);
        $rootScope.$watch("nightMode", function (night) {
          $storage.set("chars.night", night);
        });
      }

      $scope.query = $state.params.query;

      $scope.$watch("query", function (query) {
        if (
          query === null ||
          query === undefined ||
          $scope.query == $stateParams.query
        )
          return;
        $state.go(".", { query: $scope.query });
        $scope.table.parameters = CharUtils.generateSearchParameters(
          $scope.query,
          jQuery.extend({}, $rootScope.filters)
        );
      });

      $scope.$on("$stateChangeSuccess", function (e) {
        if ($state.current.name == "main.search") {
          $scope.query = $state.params.query;
        }
      });

      $scope.clearQuery = function () {
        $scope.query = "";
      };
    }
  );

  app.controller(
    "SidebarCtrl",
    function ($scope, $rootScope, $stateParams, $timeout) {
      $scope.availableClasses = window.availableClasses;
      $scope.availableTags = window.availableTags;

      $timeout(function () {
        $scope.$watch(
          "filters",
          function (filters) {
            if (
              !$rootScope.filters ||
              Object.keys($rootScope.filters).length === 0
            )
              return;
            var data = jQuery.extend({}, $rootScope.filters);
            $scope.table.parameters = CharUtils.generateSearchParameters(
              $stateParams.query,
              data
            );
            if (!$scope.$$phase) $scope.$apply();
          },
          true
        );
      });

      $scope.clearFilters = function () {
        $rootScope.filters = {
          custom: {},
          classes: [],
          tags: [],
          types: [],
          stars: [],
          cost: [1, 99],
          toggle: true,
          typeEnabled: false,
          characterEnabled: false,
          classEnabled: false,
          tagEnabled: false,
          rumbleStyleEnabled: false,
          dropEnabled: false,
          temporaryEnabled: false,
          specCaptEnabled: false,
          tmkcEnabled: false,
          exclusionEnabled: false,
          costEnabled: false,
          rarityEnabled: false,
          farmEnabled: false,
          nonfarmEnabled: false,
        };

        // no idea why both local `filters` and `$rootScope.filters` exist
        for (const target in window.matchers) {
          $rootScope.filters.custom[target] = {};
          for (const group in window.matchers[target]) {
            // `expanded` - when a filter group is "opened"
            $rootScope.filters.custom[target][group] = {
              expanded: false,
              matchers: {},
            };

            for (const name in window.matchers[target][group]) {
              $rootScope.filters.custom[target][group].matchers[name] = {
                enabled: false,
              };

              if (window.matchers[target][group][name].submatchers) {
                $rootScope.filters.custom[target][group].matchers[
                  name
                ].submatchers = [];

                for (const j in window.matchers[target][group][name]
                  .submatchers) {
                  $rootScope.filters.custom[target][group].matchers[
                    name
                  ].submatchers[j] = {};
                }
              }
            }
          }
        }
        $("#leftContainer .collapse").collapse("hide");
      };

      $scope.clearFilters();

      $scope.toggleFilters = function () {
        for (x in $rootScope.filters) {
          if (x.includes("Enabled")) {
            // type, character, class, and tag filters are expanded by default
            if (
              x == "typeEnabled" ||
              x == "characterEnabled" ||
              x == "classEnabled" || 
              x == "tagEnabled"
            ) {
              $rootScope.filters[x] = !$rootScope.filters["toggle"];
            } else {
              $rootScope.filters[x] = $rootScope.filters["toggle"];
            }
          }
        }
        $("#leftContainer animate-collapse + div.collapse").collapse(
          $rootScope.filters["toggle"] ? "show" : "hide"
        );
        $rootScope.filters["toggle"] = !$rootScope.filters["toggle"];
      };

      $scope.onFilterClick = function (e, value) {
        var type = null;
        if (e.target.hasAttribute("ng-model"))
          type = e.target.getAttribute("ng-model");
        else {
          var target = $(e.target);
          var child = target.find(".filter[ng-model]").first();
          if (child.length > 0) type = child.attr("ng-model");
          else {
            var parent = target.closest(".filter[ng-model]").first();
            if (parent.length > 0) type = parent.attr("ng-model");
          }
        }
        if (type === null) return;
        type = type.split(/\./)[1];
        $rootScope.filters[type] =
          $rootScope.filters[type] == value ? null : value;
      };

      $scope.onTypeClick = function (e, value) {
        if ($rootScope.filters.types.indexOf(value) == -1) {
          $rootScope.filters.types.push(value);
        } else
          $rootScope.filters.types.splice(
            $rootScope.filters.types.indexOf(value),
            1
          );
      };

      $scope.onClassClick = function (e, clazz) {
        if ($rootScope.filters.classes.indexOf(clazz) == -1) {
          $rootScope.filters.classes.push(clazz);
        } else
          $rootScope.filters.classes.splice(
            $rootScope.filters.classes.indexOf(clazz),
            1
          );
      };

      $scope.onTagsClick = function (e, tags) {
        if ($rootScope.filters.tags.indexOf(tags) == -1) {
          $rootScope.filters.tags.push(tags);
        } else
          $rootScope.filters.tags.splice(
            $rootScope.filters.tags.indexOf(tags),
            1
          );
      };

      $scope.onStarsClick = function (e, stars) {
        if ($rootScope.filters.stars.indexOf(stars) == -1)
          $rootScope.filters.stars.push(stars);
        else
          $rootScope.filters.stars.splice(
            $rootScope.filters.stars.indexOf(stars),
            1
          );
      };

      $scope.onDropFilterClick = function (e, value) {
        var tokens = e.target.getAttribute("ng-model").split(/\./).slice(1);
        var type = tokens[0],
          key = tokens[1];
        if (!$rootScope.filters.hasOwnProperty(type))
          $rootScope.filters[type] = {};
        $rootScope.filters[type][key] =
          $rootScope.filters[type][key] == value ? null : value;
      };

      $scope.filterData = window.matchers;

      $scope.repeat = function (n) {
        return n < 1 ? [] : new Array(n);
      };
    }
  );

  app.controller(
    "DetailsCtrl",
    function (
      $scope,
      $rootScope,
      $state,
      $stateParams,
      $timeout,
      $storage,
      $http
    ) {

      $scope.rumble = undefined;

      // data
      var id = parseInt($stateParams.id, 10);
      $scope.id = id;
      $scope.unit = jQuery.extend({}, window.units[id - 1]);
      $scope.hybrid =
        $scope.unit.class && $scope.unit.class.constructor == Array;
      $scope.dualunit =
        $scope.unit.type && $scope.unit.type.constructor == Array;
      $scope.getTagsForUnit = function (unit) {
        if (!unit || typeof unit.number === "undefined") return [];

        const tags = window.tags?.[unit.number];

        return tags || [];
      };
      $scope.isGroupedTags = function (tags) {
        return Array.isArray(tags) && Array.isArray(tags[0]);
      };
      $scope.getCategoryClass = function (tag) {
        const match = window.availableTags.find((t) => t.name === tag);
        return match ? `tag-category-${match.category}` : "";
      };

      $scope.details = window.details[id];
      $scope.cooldown = window.cooldowns[id - 1];
      $scope.evolution = window.evolutions[id];
      $scope.families = window.families[id];
      $scope.farmableVersions = CharUtils.getFarmableVersions(id);
      $scope.displayFamily = $scope.families ? $scope.families.join(" & ") : "";

      if (window.rumble[id]) {
        $scope.rumble = window.rumble[id].character1 ? window.rumble[id].character1 : window.rumble[id];
        $scope.rumble2 = window.rumble[id].character2;
      };

      $scope.customLevel = {};
      $scope.isArray = Array.isArray;

      // derived data
      var evolvesFrom = Utils.searchBaseForms(id);
      $scope.evolvesFrom = [];
      for (var from in evolvesFrom) {
        for (var i = 0; i < evolvesFrom[from].length; ++i)
          $scope.evolvesFrom.push({
            from: parseInt(from, 10),
            to: $scope.id,
            via: evolvesFrom[from][i],
          });
      }
      $scope.usedBy = CharUtils.searchEvolverEvolutions(id);
      $scope.drops = CharUtils.searchDropLocations(id);
      $scope.manuals = CharUtils.searchDropLocations(-id);
      $scope.sameSpecials = CharUtils.searchSameSpecials(id);
      $scope.collapsed = {
        to: true,
        from: true,
        used: true,
        drops: true,
        manuals: true,
        families: true,
      };

      // hidden elements
      var isPreview = $scope.unit.preview;
      var hasStats = [
        "minHP",
        "minATK",
        "minRCV",
        "maxHP",
        "maxATK",
        "maxRCV",
      ].some(function (x) {
        return $scope.unit[x];
      });
      $scope.hidden = {
        stats: isPreview && !hasStats,
        abilities: isPreview && !window.details.hasOwnProperty($scope.id),
      };

      // events/functions
      $scope.getEvos = CharUtils.getEvolversOfEvolution;
      $scope.sizeOf = function (target) {
        return Object.keys(target).length;
      };
      $scope.withButton = $stateParams.previous.length > 0;
      $scope.onBackClick = function () {
        var previous = $stateParams.previous.splice(-1)[0];
        $state.go("main.search.view", {
          id: previous,
          previous: $stateParams.previous,
        });
      };
      $scope.openBigThumbTab = function (id) {
        window.open(Utils.getBigThumbnailUrl(id, ".."), "_blank");
      };
      $scope.getPrevious = function () {
        return $stateParams.previous.concat($scope.id);
      };
      $scope.isCaptainHybrid =
        $scope.details &&
        $scope.details.captain &&
        ($scope.details.captain.base ||
          $scope.details.captain.combined ||
          $scope.details.captain.character1);
      $scope.isSailorHybrid =
        $scope.details &&
        $scope.details.sailor &&
        ($scope.details.sailor.level1 ||
          $scope.details.sailor.combined ||
          $scope.details.sailor.character1);
      $scope.isSpecialHybrid =
        $scope.details &&
        $scope.details.special &&
        ($scope.details.special.base ||
          $scope.details.special.character1);
      $scope.isCooldownHybrid =
        $scope.cooldown && Array.isArray($scope.cooldown[0]);
      $scope.isSpecialStaged =
        $scope.details &&
        $scope.details.special &&
        (($scope.details.special.base &&
          $scope.details.special.base.constructor == Array) ||
          $scope.details.special.constructor == Array);
      $scope.isLLBSpecialStaged = [false, false, false, false, false];
      if ($scope.details && $scope.details.lLimit) {
        for ([key, value] of Object.entries($scope.details.lLimit)) {
          $scope.isLLBSpecialStaged[key] =
            $scope.details.lLimit[key] &&
            $scope.details.lLimit[key].special &&
            $scope.details.lLimit[key].special.base &&
            $scope.details.lLimit[key].special.base.constructor == Array
              ? true
              : false;
        }
      }
      $scope.isLimitStaged =
        $scope.details &&
        $scope.details.limit &&
        $scope.details.limit.constructor == Array;
      $scope.isPotentialStaged =
        $scope.details &&
        $scope.details.potential &&
        $scope.details.potential.constructor == Array;
      $scope.isSupportStaged =
        $scope.details &&
        $scope.details.support &&
        $scope.details.support.constructor == Array;
      $scope.isLastTapStaged =
        $scope.details &&
        $scope.details.lastTap &&
        $scope.details.lastTap.constructor == Array;
      $scope.isSwapHybrid =
        $scope.details && $scope.details.swap && $scope.details.swap.base;
      $scope.isVSConditionHybrid =
        $scope.details &&
        $scope.details.VSCondition &&
        $scope.details.VSCondition.character1;
      $scope.isVSSpecialHybrid =
        $scope.details &&
        $scope.details.VSSpecial &&
        $scope.details.VSSpecial.character1;

      $scope.$watch("customLevel.level", function (level) {
        if (isNaN(level) || level < 1 || level > $scope.unit.maxLevel) {
          $scope.customLevel.enabled = false;
          return;
        }
        jQuery.extend($scope.customLevel, {
          enabled: true,
          atk: CharUtils.getStatOfUnit($scope.unit, "atk", level),
          hp: CharUtils.getStatOfUnit($scope.unit, "hp", level),
          rcv: CharUtils.getStatOfUnit($scope.unit, "rcv", level),
        });
      });
      $scope.statPreference = 0;
      $scope.$watch("statPreference", function (value) {
        $scope.statPreference = value;
        return;
      });
    }
  );

  app.controller(
    "ColumnsCtrl",
    function ($scope, $rootScope, $state, $stateParams, $storage) {
      $scope.columns = {
        "Limit Break HP": false,
        "Limit Break ATK": false,
        "Limit Break RCV": false,
        "Limit Break: Expansion HP": false,
        "Limit Break: Expansion ATK": false,
        "Limit Break: Expansion RCV": false,
        "HP/ATK": false,
        "HP/RCV": false,
        "ATK/RCV": false,
        "ATK/CMB": false,
        CMB: false,
        "ATK/cost": false,
        "HP/cost": false,
        "Minimum cooldown": false,
        "Initial cooldown": false,
        "Minimum Limit Break cooldown": false,
        "Initial Limit Break cooldown": false,
        "Minimum Limit Break Expansion cooldown": false,
        "Initial Limit Break Expansion cooldown": false,
        "MAX EXP": false,
        "Limit Break Slots": false,
      };

      var additionalColumns = $storage.get("charColumns", []);

      additionalColumns.forEach(function (x) {
        if ($scope.columns.hasOwnProperty(x)) $scope.columns[x] = true;
      });

      $scope.save = function () {
        var result = Object.keys($scope.columns).filter(function (x) {
          return $scope.columns[x];
        });
        $storage.set("charColumns", result);
        window.location.reload();
      };
    }
  );
})();