var questionId;

function prepareStem(event, ui)
{

    function successHandlerFactory(questionId)
    {
        function successHandler(res, code)
        {
            console.debug(code + ": " + JSON.stringify(res));
            // check lige om indholdes er bare lidt i orden...
            if (res.error.msg == '' && res[questionId] != undefined && res[questionId].answers != undefined)
            {
                // fjern 'gamle' knapper'er
                $('#radio *').remove();
                var newContent = '';
                // gennemløb alle svar til spørgsmål
                for (var i in res[questionId].answers)
                {
                    newContent +=
                        '<label>' +
                        '<input type="radio" name="radio_choice" value="' + i +'">' + res[questionId].answers[i].answer +
                        '</label>';
                }
                $(newContent).appendTo("#radio")
                $('#radio').enhanceWithin();

                $('#radio input[type="radio"]').one
                ('click', function()
                {
                    answerID = this.value;
                });


                $('#stemKnap').one('click', function()
                {
                    // indsamle alle data
                    var postData = {};
                    postData['action']              = 'polls';
                    postData['view']                = 'process';
                    postData['poll_id']             = questionId;
                    postData['poll_' + questionId]  = answerID;
                    postData['poll_' + questionId + '_nonce']  = res['poll_' + questionId + '_nonce']

                    // send request
                    /// min postData: {"action":"poll","view":"process","poll_id":2,"poll_2":"10","poll_2_nonce":"ef888dbe6c"}
                    /// din postData: {"action":"polls","view":"process","poll_id":"2","poll_2":"8","poll_2_nonce":"ef888dbe6c"}
                    $.post('http://grahn.dk/darup/wp-admin/admin-ajax.php', postData,
                        function(returnData, code)
                        {
                            console.log('Du har stemt');
                            console.log('postData: ' + JSON.stringify(postData));
                            console.log(code + ': ' + returnData);
                            // henvise til resultat
                            //$('#resultater')[0].innerHTML = returnData;


                            // Load the Visualization API and the corechart package.
                            google.charts.load('current', {'packages':['corechart']});

                            // Set a callback to run when the Google Visualization API is loaded.
                            google.charts.setOnLoadCallback(drawChart);

                            // Callback that creates and populates a data table,
                            // instantiates the pie chart, passes in the data and
                            // draws it.

                            function drawChart()
                            {
                                var And = [];
                                $.get
                                (
                                    "http://grahn.dk/darup/vote.php?qid=" + questionId,
                                    function(res, code)
                                    {

                                        for (var i in res[questionId].answers)
                                        {
                                            //And [i]= res[questionId].answers[i].answer
                                            And[And.length] =  [ res[questionId].answers[i].answer, parseInt(res[questionId].answers[i].votes) ];
                                        }

                                        // Create the data table.
                                        var data = new google.visualization.DataTable();
                                        data.addColumn('string', 'svar');
                                        data.addColumn('number', 'stemmer');
                                        data.addRows(And)



                                        // Set chart options
                                        var options =
                                            {
                                                'title':res[questionId].question,
                                                //'width':300,
                                                //'height':500
                                                is3D: true,
                                                //backgroundColor.fill: "#189adb"
                                            };

                                        // Instantiate and draw our chart, passing in some options.
                                        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
                                        chart.draw(data, options);

                                    }
                                );
                            }
                            //drawChart();
                        }
                    ).fail
                    (
                        function (returnData, code)
                    {
                        console.log('Det virkede ikke')
                        console.log(code + ': ' + returnData);
                    })
                });
            }
        }

        return successHandler
    }

    questionId = this.dataset.id;
    $.get
    (
        'http://grahn.dk/darup/vote.php?qid=' + questionId,
        successHandlerFactory(questionId)
    )
}



function prepareCategories(event, ui)
{
    console.log("ready to load Categories");

    $.get("http://grahn.dk/darup/vote.php",
        function(res, code) {
            console.debug(code + ": " + JSON.stringify(res));

            // check lige om indholdes er bare lidt i orden...
            if (res.error.msg == '' && res.questions != undefined)
            {
                // fjern 'gamle' knapper
                $('#kategorier a').remove();
                var newContent = '';
                // gennemløb alle sæsoner i Items
                for (var i in res.questions)
                {
                    // lav en ny "knap" for hver sæson
                    // <a href="#episodes" data-role="button" data-slug="">Sæson 1</a>
                    newContent += '<a href="#stem" data-role="button" data-id="'+i+'">' + res.questions[i] + '</a>';
                }
                // tilføj knapperne til DOM'en

                $(newContent).appendTo('#kategorier');
                // lad JQM forbedre htmlen
                $('#kategorier').enhanceWithin();
                // tilføj event handler til hver knap
                $('#kategorier a').one('click', prepareStem);
            }
        }
    )
}

$(document).ready( // når siden er loaded
    function()
    {
        var pageContainer = $("body").pagecontainer
        ({
            beforeshow:
                function( event, ui)
                {
                    //hvilken side er vi ved at vise
                    console.log("beforeshow: " + ui.toPage[0].id);

                    switch(ui.toPage[0].id)
                    {
                        case "kategorier":
                            prepareCategories(event, ui);
                            break;

                        case "stem":
                            break;

                        case "forside":
                            break;
                    }
                }
        })
    }
);

