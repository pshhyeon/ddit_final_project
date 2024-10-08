$(document).ready(function() {
    var $body = $('body');
    var $modal = new bootstrap.Modal(document.getElementById('event-modal'), { backdrop: 'static' });
    var $calendar = $('#calendar');
    var $formEvent = $('#form-event');
    var $btnNewEvent = $('#btn-new-event');
    var $btnDeleteEvent = $('#btn-delete-event');
    var $btnSaveEvent = $('#btn-save-event');
    var $modalTitle = $('#modal-title');
    var calendarObj = null;
    var selectedEvent = null;
    var newEventData = null;
    var schedulNo = $('#schedulNo');
	var projNo = goProjNo;
	
	$('.projects_tab').on('click', function() {
	    loadEvents(projNo);
	});
	
	
    // 이벤트 클릭 핸들러
    function onEventClick(info) {
        $formEvent[0].reset();
        $formEvent.removeClass('was-validated');
        newEventData = info;
        $btnDeleteEvent.show();
        $modalTitle.text('일정 수정');
        $modal.show();
        selectedEvent = info.event;
        
        $('#event-title').val(selectedEvent.title);
        $('#event-category').val(selectedEvent.classNames[0]);
		
		// 요소 추가 
        $('#event-no').val(selectedEvent.extendedProps.no);
        $('#event-content').val(selectedEvent.extendedProps.content);
        
        
    }

    // 선택 핸들러
    function onSelect(info) {
        $formEvent[0].reset();
        $formEvent.removeClass('was-validated');
        selectedEvent = null;
        newEventData = info;
        console.log('info',info);
        $btnDeleteEvent.hide();
        $modalTitle.text('일정 등록');
        $modal.show();
        calendarObj.unselect();
    }

    // FullCalendar 초기화 함수
    function initializeCalendar(events) {
        calendarObj = new FullCalendar.Calendar($calendar[0], {
            slotDuration: '00:15:00',
            slotMinTime: '08:00:00',
            slotMaxTime: '19:00:00',
            themeSystem: 'bootstrap',
            bootstrapFontAwesome: false,
            buttonText: { today: 'Today', month: 'Month', week: 'Week', day: 'Day', list: 'List', prev: 'Prev', next: 'Next' },
            initialView: 'dayGridMonth',
            handleWindowResize: true,
            height: $(window).height() - 200,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            initialEvents: events, // 초기 이벤트 설정
            editable: true,
            droppable: true,
            selectable: true,
            select: function(info) { onSelect(info); },
            eventClick: function(info) { onEventClick(info); },
            eventDrop: function(info) { onEventDrop(info); }
            
        });
        calendarObj.render();
    }
	var projNo = goProjNo;
	
    // AJAX로 일정 데이터 로드
    function loadEvents(projNo) {
        $.ajax({
            url: '/project/ajax/selectScheduleList',
            method: 'GET',
            data: { projNo: projNo },
            dataType: 'json',
            success: function(data) {
                var events = data.map(function(schedul) {
                    console.log(schedul.PROJ_SCHDL_BGNG_DT)
                    return {
                        title: schedul.PROJ_SCHDL_NM,
                        no: schedul.PROJ_SCHDL_NO,
                        content: schedul.PROJ_SCHDL_CN,
                        start: schedul.PROJ_SCHDL_BGNG_DT,
                        end: schedul.PROJ_SCHDL_END_DT,
                        className: schedul.PROJ_SCHDL_COLOR,
                    };
                });
                
                initializeCalendar(events); // 이벤트 데이터를 캘린더 초기화 함수에 전달
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching tasks: ', textStatus, errorThrown);
            }
        });
    }

    // 이벤트 저장 핸들러
    $formEvent.on('submit', function(e) {
        e.preventDefault();
        var form = $formEvent[0];
        if (form.checkValidity()) {
            if (selectedEvent) {
                selectedEvent.setProp('title', $('#event-title').val());
                selectedEvent.setExtendedProp('content', $('#event-content').val());
                selectedEvent.setExtendedProp('no', $('#event-no').val());
                selectedEvent.setProp('classNames', [$('#event-category').val()]);
                
                let updateEvent = {
                    no: $('#event-no').val(),
                    title: $('#event-title').val(),
                    content: $('#event-content').val(),
                    start: selectedEvent.start,
                    end: selectedEvent.end,
                    allDay: selectedEvent.allDay,
                    className: $('#event-category').val()
                };
                updateSchedul(updateEvent);
            } else {
            
                var newEvent = {
                    no: $('#event-no').val(),
                    title: $('#event-title').val(),
                    content: $('#event-content').val(),
                    start: newEventData.start,
                    end: newEventData.end,
                    allDay: newEventData.allDay,
                    className: $('#event-category').val()
                };
                
                console.log('newEvent',newEvent);
                
                insertSchedul(newEvent);
                
                calendarObj.addEvent(newEvent);
            }
            $modal.hide();
        } else {
        
            e.stopPropagation();
            form.classList.add('was-validated');
        }
    });

    // 이벤트 삭제 핸들러
    $btnDeleteEvent.on('click', function() {
        if (selectedEvent) {
        	
        	// 삭제
        	var eventNo = selectedEvent.extendedProps.no;
            deleteSchedul(eventNo);
            
            
            selectedEvent.remove();
            selectedEvent = null;
            $modal.hide();
        }
    });

    // 새 이벤트 버튼 클릭 핸들러
    $btnNewEvent.on('click', function() {
        onSelect({ date: new Date(), allDay: true });
    });
    
    
    function insertSchedul(newEvent){
    	var dateStart = new Date(newEvent.start);
        var dateEnd = new Date(newEvent.end);
		
		let formData = {
			projschdlNo : newEvent.no,
			projSchdlNm : newEvent.title,
			projSchdlCn: newEvent.content,
			projSchdlColor: newEvent.className,
			projSchdlBgngDt : dateStart,
			projSchdlEndDt : dateEnd,
			projNo: projNo
		}
		console.log(formData)
 		
    	 $.ajax({
            url: '/project/ajax/insertSchedul',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            beforeSend : function(xhr){	// 데이터 전송 전, 헤더에 csrf 값 설정
				xhr.setRequestHeader(header, token);
			},
            success: function(data) {
            	console.log(data,"캘린더 등록되었습니다. ")
            
            }
    	})
    
    }
    
    // 드래그 앤 드롭 이벤트 함수 
    function onEventDrop(info) {
        var event = info.event;
        console.log('이벤트 드롭 핸들러', event);

        updateDateSchedul(event);
    }
    
    function updateDateSchedul(updateEvent){
    	var dateStart = new Date(updateEvent.start);
        var dateEnd = new Date(updateEvent.end);
		
		let formData = {
			projSchdlNo: updateEvent.extendedProps.no,
	        projSchdlBgngDt: dateStart,
	        projSchdlEndDts: dateEnd,
	        projNo: projNo
		}
		console.log("updateDateSchedul",formData)
		
    	 $.ajax({
            url: '/project/ajax/updateDateSchedul',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            beforeSend : function(xhr){	// 데이터 전송 전, 헤더에 csrf 값 설정
				xhr.setRequestHeader(header, token);
			},
            success: function(data) {
            	console.log(data,"캘린더가 날짜가 수정되었습니다. ")
            
            }
    	})
    
    }
    
    function updateSchedul(newEvent){
    	var dateStart = new Date(newEvent.start);
        var dateEnd = new Date(newEvent.end);
		let formData = {
			projSchdlNo: newEvent.no,
	        projSchdlNm: newEvent.title,
	        projSchdlCn: newEvent.content,
	        projSchdlColor: newEvent.className,
	        projSchdlBgngDt: dateStart,
	        projSchdlEndDt: dateEnd,
	        projNo: projNo
		}
    	 $.ajax({
            url: '/project/ajax/updateSchedul',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            beforeSend : function(xhr){	// 데이터 전송 전, 헤더에 csrf 값 설정
				xhr.setRequestHeader(header, token);
			},
            success: function(data) {
            	console.log(data,"캘린더가 수정되었습니다. ")
            
            }
    	})
    
    }
    
     function deleteSchedul(eventNo){
        $.ajax({
            url: '/project/ajax/deleteSchedul',
            type: 'POST',
            data: JSON.stringify({ projschdlNo: eventNo }),
            contentType: 'application/json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function(data) {
                console.log(data, "캘린더가 삭제되었습니다.");
            }
        });
    }
    
   
    
	loadEvents(goProjNo);
});
