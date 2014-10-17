(function($){


	$.fn.dateTimePicker = function(opts){
		var opt = $.extend(true, {
                days :['SUN','MON','TUS','WED','THU','FRI','SAT'],
                months : ['JANUARY','FEBRUARY','MATCH','APRIL','MAY','JUNE',
                          'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']}, opts),self = $(this),
			
			//get left calendar element.
			$leftCalendar = $(this).find(".calendar-left"),
			//get right calendar element.
			$rightCalendar = $(this).find(".calendar-right");


            buildLeftCalendar();
            buildRightCalendar();

            //build left calender
			function buildLeftCalendar(){
                buildMonth($leftCalendar,new Date());
                buildDays($leftCalendar.find("table"));
                buildDates($rightCalendar.find("table"),new Date());
			}

            //build right calendar.
            function buildRightCalendar(){
                buildMonth($rightCalendar,new Date());
                buildDays($rightCalendar.find("table"));
                buildDates($leftCalendar.find("table"),new Date());
            }

            //build the calendar's days
            function buildDays($node){
                var $thead =$node.find("thead").append('<tr></tr>');
                for(var i=0 ; i<opt.days.length;i++){
                    var $th=$('<th>'+opt.days[i]+'</th>');
                    $thead.find("tr").append($th);
                }
            }

            //build calendar month and year.
            function buildMonth($node,date){
                    var year = date.getFullYear(),
                        month = opt.months[date.getMonth()];
                        $node.find(".month-year").empty().data("selected-month",date.getTime())
                             .text(month+" "+year);
            }

            //build the date.
            function buildDates($node,date){
                var newDate =new Date(date.setDate(1)),
                    startDay = newDate.getDay(),
                    daysOfNum = daysInMonth(newDate.getFullYear(),newDate.getMonth()),
                    $tbody = $node.find("tbody").empty().append("<tr></tr>"),count=1;

                    for(var i=0;i<startDay;i++){
                        $tbody.find("tr").append("<td></td>");
                    }
                    for(var i=1 ;i<=daysOfNum ;i++){
                        var dateOfMonth = new Date(date.setDate(i)),
                            dateTime = dateOfMonth.getTime();
                        if(startDay+i<=7){
                            $tbody.find("tr").append("<td data-current-day="+dateTime+" class='single-day'>"+i+"</td>");continue;
                        }

                        if(count%8==0||(startDay+i)==8){
                            $tbody.append("<tr></tr>");count=1;
                        }

                        $tbody.find("tr:last-child").append("<td data-current-day="+dateTime+"  class='single-day'>"+i+"</td>");
                        count++;

                    }
                    var len = $tbody.find("tr:last-child td").length;
                    for(var i=0 ;i<7-len;i++){
                        $tbody.find("tr:last-child").append("<td></td>");
                    }
            }

            //listen prev month event.
            $(this).find(".prev-month").on("click",function(){
                var selectedDate =new Date($(this).next().data("selected-month"));
                    if(selectedDate.getMonth()==0){
                        selectedDate.setMonth(11);
                        selectedDate.setFullYear(selectedDate.getFullYear()-1);
                    }else{
                        selectedDate.setMonth(selectedDate.getMonth()-1);
                    }
                    if($(this).hasClass('left-calendar')){
                        buildMonth($leftCalendar,selectedDate);
                        buildDates($leftCalendar.find("table"),selectedDate);
                    }else{
                        buildMonth($rightCalendar,selectedDate);
                        buildDates($rightCalendar.find("table"),selectedDate);
                        disableEndStartDate();
                    }

                    drawSurveyDates();
            });

            //listen next month event.
            $(this).find(".next-month").on("click",function(){
                var selectedDate =new Date($(this).prev().data("selected-month"));
                    if(selectedDate.getMonth()==11){
                        selectedDate.setMonth(0);
                        selectedDate.setFullYear(selectedDate.getFullYear()+1);
                    }else{
                        selectedDate.setMonth(selectedDate.getMonth()+1);
                    }
                    if($(this).hasClass('left-calendar')){
                        buildMonth($leftCalendar,selectedDate);
                        buildDates($leftCalendar.find("table"),selectedDate);
                    }else{
                        buildMonth($rightCalendar,selectedDate);
                        buildDates($rightCalendar.find("table"),selectedDate);
                        disableEndStartDate();
                    }

                    drawSurveyDates();
            });

            //get days of specified month.
            function daysInMonth(year, month){
                return new Date(year, month+1, 0).getDate();
            }

            //listen selected date clicked event
            $(this).delegate('td.single-day', 'click', function(event) {
                 var currentDay = new Date($(this).data("current-day"));
                  if($(this).closest('table').hasClass('start-calendar')){
                     endDate = self.find("input.end-calendar").val();
                     if(endDate){
                         clearRightCalendar();
                         self.find("input.end-calendar").val('');
                     }
                 }
                 setSelectedDate(currentDay,$(this));
                 drawSurveyDates();
            });

            //set selected date to date input
            function setSelectedDate(date,$node){
                var year = date.getFullYear(),
                    month = date.getMonth()<9?("0"+(date.getMonth()+1)):(date.getMonth()+1),
                    day = date.getDate()<10?("0"+date.getDate()):date.getDate(),
                    formatDate= month+"/"+day+"/"+year;
                    if($node.closest('table').hasClass('start-calendar')){
                            $node.closest('tbody').find(".selected-date-start").removeClass('selected-date-start');
                            $node.addClass('selected-date-start');
                            self.find("input.start-calendar").val(formatDate);
                            disableEndStartDate();
                    }else{
                            $node.closest('tbody').find(".selected-date-end").removeClass('selected-date-end');
                            $node.addClass('selected-date-end');
                            self.find("input.end-calendar").val(formatDate);
                    }
            }

            //draw survey dates.
            function drawSurveyDates(){
                var startDate = self.find("input.start-calendar").val(),
                    endDate = self.find("input.end-calendar").val();
                    if(startDate&&endDate){
                         calculateDays(startDate,endDate);
                    }
            }

            //disable the date before start date on end calendar.
            function disableEndStartDate(){
                var startDate = new Date(self.find("input.start-calendar").val());
                self.find("table.end-calendar .disabled-date").removeClass('disabled-date').addClass('single-day');
                self.find("table.end-calendar .single-day").each(function(index){
                    var singleDay = new Date($(this).data('current-day'));
                        var durationDays = Math.floor((singleDay.getTime()-startDate.getTime())/1000/60/60/24)+ 1;
                        if(singleDay.getTime()<=startDate.getTime()){
                            $(this).removeClass("single-day").addClass('disabled-date');
                        }
                        if(durationDays>30){
                            $(this).removeClass("single-day").addClass('disabled-date');
                        }
                });
            }

            //calculate days between start date and end date.
            function calculateDays(startDate,endDate){
                    var sDate = new Date(startDate),
                        eDate = new Date(endDate);
                    if(eDate.getTime()-sDate.getTime()>0){
                         var durationDays = Math.floor((eDate.getTime()-sDate.getTime())/1000/60/60/24)+ 1,
                             displayedStartMonth = new Date(self.find(".calendar-left .month-year").data("selected-month")),
                             displayedEndMonth = new Date(self.find(".calendar-right .month-year").data("selected-month"));

                                self.find("table.start-calendar .single-day").removeClass('selected-date-start')
                                    .removeClass('selected-date-end').each(function(index){
                                      var singleDay = new Date($(this).data('current-day'));
                                      if(singleDay.getTime()>=sDate.getTime()&&singleDay.getTime()<eDate.getTime()){
                                          $(this).addClass('selected-date-start');
                                      }

                                     if(singleDay.getDate()==eDate.getDate()&&singleDay.getMonth()==eDate.getMonth()){
                                         $(this).addClass('selected-date-end');
                                     }
                                })

                                self.find("table.end-calendar .single-day").removeClass('selected-date-start')
                                    .removeClass('selected-date-end').each(function(index){
                                        var singleDay = new Date($(this).data('current-day'));
                                        if(singleDay.getTime()>=sDate.getTime()&&singleDay.getTime()<eDate.getTime()){
                                            $(this).addClass('selected-date-start');
                                        }
                                        if(singleDay.getDate()==eDate.getDate()&&singleDay.getMonth()==eDate.getMonth()){
                                            $(this).addClass('selected-date-end');
                                        }
                                    })

                    }
            }
            // clear right calendar and re-draw
            function clearRightCalendar(){
                var selectedDate = new Date(self.find("input.end-calendar").val());
                buildDates($rightCalendar.find("table"),selectedDate);
                $leftCalendar.find("table.start-calendar .selected-date-end").removeClass('selected-date-end');
            }
	}

}(jQuery));