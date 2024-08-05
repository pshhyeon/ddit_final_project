<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Email Read</title>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
<div class="container-fluid">
    <!-- start page email-title -->
    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="javascript: void(0);">Hyper</a></li>
                        <li class="breadcrumb-item"><a href="javascript: void(0);">Email</a></li>
                        <li class="breadcrumb-item active">Email Read</li>
                    </ol>
                </div>
                <h4 class="page-title">Email Read</h4>
            </div>
        </div>
    </div>
    <!-- end page title -->
    <!-- end page email-title -->

    <div class="row">
        <!-- Right Sidebar -->
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <!-- Left sidebar -->
                    <div class="page-aside-left">
                        <div class="d-grid">
                            <a href="${pageContext.request.contextPath}/egg/mail/compose" class="btn btn-danger">Compose</a>
                        </div>

                        <div class="email-menu-list mt-3">
                            <a href="${pageContext.request.contextPath}/egg/mail/reList" class="text-danger fw-bold">
                                <i class="ri-inbox-line me-2"></i>수신메일함
                                <span class="badge badge-danger-lighten float-end ms-2">${listCount}</span>
                            </a>
                            <a href="${pageContext.request.contextPath}/egg/mail/impoList">
                                <i class="ri-star-line me-2"></i>중요메일함
                                <span class="badge badge-info-lighten float-end ms-2"></span>
                            </a>
                            <a href="${pageContext.request.contextPath}/egg/mail/drfList">
                                <i class="ri-article-line me-2"></i>임시보관함
                                <span class="badge badge-info-lighten float-end ms-2"></span>
                            </a>
                            <a href="${pageContext.request.contextPath}/egg/mail/sendList">
                                <i class="ri-mail-send-line me-2"></i>보낸 메일함
                                <span class="badge badge-info-lighten float-end ms-2"></span>
                            </a>
                            <a href="${pageContext.request.contextPath}/egg/mail/trashList">
                                <i class="ri-delete-bin-line me-2"></i>휴지통
                                <span class="badge badge-info-lighten float-end ms-2"></span>
                            </a>
                            <a href="${pageContext.request.contextPath}/egg/mail/mineList">
                                <i class="ri-price-tag-3-line me-2"></i>내게 쓴 메일함
                                <span class="badge badge-info-lighten float-end ms-2"></span>
                            </a>
                        </div>

                 
                    </div>
                    <!-- End Left sidebar -->

                    <div class="page-aside-right">
                        
                        <div class="btn-group">
                  

                        <div class="mt-3">
                            <h5 class="font-18">${mail.emlTtl}</h5>
                            <hr>
                            <div class="d-flex mb-3 mt-1">
                                <div class="w-100 overflow-hidden">
                                    <small class="float-end">${mail.emlDt}</small>
                                </div>
                            </div>
                            <p>${mail.emlCn}</p>
                            <small class="text-muted">From: ${mail.sendId}</small>
                            <hr>
                            <div>
                                <h6>Attachments:</h6>
                                <ul>
                                    <c:forEach var="file" items="${files}">
                                        <li>
                                            <a href="${pageContext.request.contextPath}/egg/mail/download?fileNo=${file.fileNo}" target="_blank">
                                                ${file.fileOrgnlNm}
                                            </a>
                                        </li>
                                    </c:forEach>
                                </ul>
                            </div>
                            <div class="mt-5">
                                <form id="deleteForm" class="d-inline">
                                    <input type="hidden" name="mreNo" value="${mreNo}">
                                    <button type="button" class="btn btn-secondary me-2" id="deleteBtn"><i class="mdi mdi-reply me-1"></i> 영구 삭제</button>
                                </form>
                                <a href="#" class="btn btn-light cancel-delete" data-mreno="${mreNo}" id="clickId">복구하기 <i class="mdi mdi-forward ms-1"></i></a>
                            </div>
                        </div>
                        <!-- end .mt-4 -->
                    </div>
                    <!-- end inbox-rightbar-->
                </div>
                <div class="clearfix"></div>
            </div> <!-- end card-box -->
        </div> <!-- end Col -->
    </div><!-- End row -->
</div>

<script type="text/javascript">
$(document).ready(function(){
    var csrfToken = $("meta[name='_csrf']").attr("content");
    var csrfHeader = $("meta[name='_csrf_header']").attr("content");

    $('#deleteBtn').click(function(){
        if(confirm("영구 삭제 하시겠습니까?")) {
            $.ajax({
                url: '${pageContext.request.contextPath}/egg/mail/deletePermanently',
                type: 'POST',
                data: $('#deleteForm').serialize(),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader(csrfHeader, csrfToken);
                },
                success: function(response) {
                    if(response === 'success') {
                        alert('메일이 영구 삭제되었습니다.');
                        window.location.href = '${pageContext.request.contextPath}/egg/mail/trashList';
                    } else {
                        alert('메일 삭제가 실패했습니다.');
                    }
                },
                error: function() {
                    alert('오류가 발생했습니다.');
                }
            });
        }
    });

    $('#clickId').click(function(){
        alert("복구 하시겠습니까?");
    });
    
    $('.cancel-delete').click(function(){
        var mreNo = $(this).data('mreno');
        console.log("Delete mail clicked, mreNo: " + mreNo);
        sendAjaxRequest("${pageContext.request.contextPath}/egg/mail/deleteCancel", mreNo);
        window.location.href = '${pageContext.request.contextPath}/egg/mail/trashList';
    });

    function sendAjaxRequest(url, mreNo) {
        $.ajax({
            type: "POST",
            url: url,
            data: { mreNo: mreNo },
            beforeSend: function(xhr) {
                xhr.setRequestHeader(csrfHeader, csrfToken);
            },
            success: function(response) {
                console.log("Success, response: " + response);
                alert('성공스.');
                document.location.href = document.location.href;
            },
            error: function(xhr, status, error) {
                console.log("왜 에러야 도대체: " + status + ", error: " + error);
            }
        });
    }
});

</script>
</body>
</html>
