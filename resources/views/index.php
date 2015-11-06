<!doctype html>
<html lang="en" ng-app="phonecatApp">
<head>
    <meta charset="utf-8">
    <title>Google Phone Gallery</title>
    <link rel="stylesheet" href="bower_components/angular-bootstrap/ui-bootstrap-csp.css">
    <link rel="stylesheet" href="css/app.css">
    <link rel="stylesheet" href="css/animations.css">

    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-animate/angular-animate.js"></script>
    <script src="bower_components/angular-route/angular-route.js"></script>
    <script src="bower_components/angular-resource/angular-resource.js"></script>
    <script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>

    <script src="js/app.js"></script>
    <script src="js/animations.js"></script>
    <script src="js/controllers.js"></script>
    <script src="js/filters.js"></script>
    <script src="js/services.js"></script>
</head>
<body>

<div class="view-container">
    <div ng-view class="view-frame"></div>
</div>

</body>
</html>
