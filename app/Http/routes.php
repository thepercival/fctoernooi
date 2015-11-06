<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    return view('index');
});

// API ROUTES ==================================
Route::group(array('prefix' => 'api/v1'), function() {

    // http://localhost:8000/api/v1/competitionseason/
    Route::resource('competitionseason', 'ApiCtrl',
        array('only' => array('index')));

});

Route::any('{{catch_all}}', function()
{
    App::abort(404);
});