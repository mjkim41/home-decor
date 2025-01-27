import CarouselManager from "../ui/CarouselManager.js";

// 캐러셀 전역관리
let step2Carousel = null;
let step3Carousel = null;

// 선택한 이미지 파일들을 전역관리
let selectedFiles = null;
// step 모듈내에서 전역관리
let currentStep = 1;

// 피드 생성 모달을 전역관리
let $modal = document.getElementById('createPostModal'); // 모달 컨테이너

// 모달 관련 DOM들을 저장할 객체
let elements = {
    $closeBtn: $modal.querySelector('.modal-close-button'),
    $backdrop: $modal.querySelector('.modal-backdrop'),
    $uploadBtn: $modal.querySelector('.upload-button'),
    $fileInput: $modal.querySelector('#fileInput'),
    $backStepBtn: $modal.querySelector('.back-button'),
    $nextStepBtn: $modal.querySelector('.next-button'),
    $modalTitle: $modal.querySelector('.modal-title'),
    // 드래그
    $uploadArea: $modal.querySelector('.upload-area'),
    // 텍스트
    $contentTextarea: $modal.querySelector('.content-input textarea'),
    $charCounter: $modal.querySelector('.char-counter'),
    //중첩 모달
    $nestedModal: $modal.querySelector('.nested-modal'),
    $deleteBtn: $modal.querySelector('.delete-button'),
    $cancelBtn: $modal.querySelector('.cancel-button'),
};

// API 서버에 피드 내용과 이미지들 전송
async function fetchFeed() {
    if (currentStep !== 3) return;
    const {$contentTextarea} = elements;

    // 작성자의 user id를 먼저 찾아야 함'
    const localstorageAccessToken = localStorage.getItem("accessToken");
    const meResponse = await fetch(`api/profiles/tk/${localstorageAccessToken}`);
    const responseData = await meResponse.json();
    const userId = responseData.userId;


    // 작성자 이름과 피드 내용 전송
    const feedData = {
        userId: userId,
        content: $contentTextarea.value.trim()
    };

    // 이미지 정보

    // JSON과 이미지를 같이 전송하려면 form-data가 필요함
    const formData = new FormData();
    // JSON 전송
    formData.append('feed', new Blob([JSON.stringify(feedData)], {
        type: 'application/json'
    })); // JSON 넣기


    // 이미지 전송
    selectedFiles.forEach(file => {
        formData.append('images', file);
    });

    // 서버에 POST요청 전송
    const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
        window.location.reload();
    } else {
        console.error('fail to request');
        alert(data.message);
    }
}

// 모달 바디 스텝을 이동하는 함수
function goToStep(step) {
    if (step < 1 || step > 3) return;

    currentStep = step;
    const {$backStepBtn, $nextStepBtn, $modalTitle} = elements;

    // 기존 스텝 컨테이너의 active를 제거하고 해당 step컨테이너에 active를 부여
    [...$modal.querySelectorAll('.step')].forEach(($stepContainer, index) => {
        $stepContainer.classList.toggle('active', step === index + 1);
    });

    // }
    //
    //     if ($stepContainer.classList.contains('active')) {
    //         $stepContainer.classList.remove('active');
    //     }
    //     if (step === index + 1) {
    //         $stepContainer.classList.add('active');
    //     }

    //각 스텝별 버튼 활성화 비활성화 처리
    if (step === 1) {
        $nextStepBtn.style.display = 'block';
        $backStepBtn.style.display = 'none';
        $modalTitle.textContent = '새 게시물 만들기';
    } else if (step === 2) {
        $nextStepBtn.style.display = 'block';
        $backStepBtn.style.display = 'block';
        $modalTitle.textContent = '편집';
        $nextStepBtn.textContent = '다음';
    } else if (step === 3) {
        $nextStepBtn.style.display = 'block';
        $nextStepBtn.textContent = '공유하기';
        $modalTitle.textContent = '새 게시물 만들기';
    }
}

//파일 업로드 관련 이벤트 함수
function setUpFileUploadEvents() {
    const {$uploadBtn, $fileInput, $uploadArea} = elements;


    // 파일을 검사하는 함수
    const validateFiles = files => {
        return files
            .filter(file => {
                if (!file.type.startsWith('image')) {
                    alert(`${file.name}은(는) 이미지가 아닙니다ㅣ.`);
                    return false;
                }
                return true;
            })
            .filter(file => {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`${file.name}은(는) 10MB를 초과합니다.`);
                    return false;

                }
                return true;
            });
    };

    // 파일을 검사하고 다음 단계로 이동하는 함수
    const handleFiles = (files) => {
        // 파일의 개수가 10개가 넘는지 검사
        if (files.length > 5) {
            alert('최대 5개의 파일만 선택 가능합니닷');
            return;
        }


        //파일이 이미지인지 확인
        const validFiles = validateFiles(files);

        // 서버전송을 위해 전역변수에 저장
        selectedFiles = validFiles;

        // 이미 생성되어 있다면, 그냥 init()만 다시 호출해서 '슬라이드 모록'만 업데이트
        if (step2Carousel && step3Carousel) {
            step2Carousel.init(validFiles);
            step3Carousel.init(validFiles);
        }
        // 최초 생성이라면 새로 만든다.
        else {
            step2Carousel = new CarouselManager(
                $modal.querySelector('.preview-container')
            );
            step3Carousel = new CarouselManager(
                $modal.querySelector('.write-container')
            );

            step2Carousel.init(validFiles);
            step3Carousel.init(validFiles);
        }

        // 모달 step2로 이동
        goToStep(2);

    };

    // 업로드 버튼을 누르면 파일선택창이 대신 눌리도록 조작
    $uploadBtn.addEventListener('click', e => $fileInput.click());

    //파일 선택이 끝날을 때 파일정보를 읽는 이벤트
    $fileInput.addEventListener('change', e => {
        const files = [...e.target.files];
        if (files.length > 0) handleFiles(files);

    });

    // 파일 드래그 & 드롭 이벤트
    //드래그 영역 진입했을 때
    $uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        $uploadArea.classList.add('dragover');
    });

    //드래그 영역에서 나갔을 때
    $uploadArea.addEventListener('dragleave', e => {
        e.preventDefault();
        $uploadArea.classList.remove('dragover');
    });

    // 드래그 영역에서 떨궜을 때
    $uploadArea.addEventListener('drop', e => {
        e.preventDefault(); // 드롭했을 때 이미지 새탭이 열리거나 파일이 다운로드 되는 것을 막아줌

        // 파일 정보 얻어오기
        const files = [...e.dataTransfer.files];

        // 파일 검증
        if (files.length > 0) handleFiles(files);
    });
}


// 피드 생성 모달 관련 이벤트 함수
async function setUpModalEvents() {
    const {$closeBtn, $backdrop, $backStepBtn, $nextStepBtn, $nestedModal} = elements;
    // DOM  요소 가져오기
    const $writeButton = document.getElementById('write-button'); // 글쓰기

    //모달 열기 함수
    const openModal = async e => {
        e.preventDefault();
        // 로그인 여부 확인해서, 로그인 안했으면 로그인 페이지로 이동
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken === null) {
            document.body.style.opacity = 0; // 페이지를 서서히 사라지게 만듭니다.
            setTimeout(() => {
                window.location.href = "/login";
            }, 200); // 0.5초 후에 로그인 페이지로 이동합니다.
        }
        // 모달 열기
        $modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 배경 바디 스크롤 방지

        // # 사용자 정보 불러와서 렌더링
        // 1. 서버에 현재 로그인한 사람 정보 요청
        const accessToken2 = localStorage.getItem("accessToken");
        const response = await fetch(`/api/profiles/tk/${accessToken2}`);
        const me = await response.json();

        // 2. 유저 정보를 화면에 렌더링
        const $writeArea = $modal.querySelector('.write-area');
        let $profileImage = $writeArea.querySelector('.profile-image img');
        let $userName = $writeArea.querySelector('span.username');

        $userName.textContent = me.nickname;
        $profileImage.src = me.profileImageUrl;
    };

    //모달 닫기
    const closeModal = e => {
        e.preventDefault();

        //step2부터는 모달을 닫으면 안됨. 대신 새로운 모달을 띄워야 함
        if (currentStep >= 2) {
            // 중첩모달을 띄우기
            $nestedModal.style.display = 'flex';
            return;
        }

        $modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 배경 바디 스크롤 방지 해제
    }

    // 피드 생성 모달 열기 이벤트
    $writeButton.addEventListener('click', openModal);

    // X버튼 눌렀을 때
    $closeBtn.addEventListener('click', closeModal);

    // 백드롭 눌렀을 때
    $backdrop.addEventListener('click', closeModal);

    // 모달 이전, 다음 스텝 클릭 이벤트
    $backStepBtn.addEventListener('click', () => goToStep(currentStep - 1));
    $nextStepBtn.addEventListener('click', () => {
        if (currentStep < 3) {
            goToStep(currentStep + 1);

        } else {
            alert('게시물을 저장합니다.');
            fetchFeed(); //서버에 요청 전송
        }
    });
}

// 피드 모달 닫을 때 나가기 취소 관련
function setupNestedModalEvents() {
    const {$nestedModal, $deleteBtn, $cancelBtn} = elements;

    //취소처리 - 중첩모달만 닫기
    $cancelBtn.addEventListener('click', () => {
        $nestedModal.style.display = 'none';
    });

    //삭제처리 - 모든 모달을 닫고 초기상태로 귀환
    $deleteBtn.addEventListener('click', () => {
        //새로고침시 모든것이 초기로 돌아감
        window.location.reload();
    });
}

// 이벤트 바인딩 관련 함수
function bindEvents() {
    setUpModalEvents(); //모달 관련 이벤트
    setUpFileUploadEvents(); // 파일업로드 관련 이벤트
    setupTextareaEvents(); // 텍스트 입력 관련 이벤트
    setupNestedModalEvents(); // 중첩 모달 이벤트

}

// 피드 내용 입력 이벤트
function setupTextareaEvents() {
    const {$contentTextarea, $charCounter} = elements;

    $contentTextarea.addEventListener('keydown', () => {
        const length = $contentTextarea.value.length;
        $charCounter.textContent = `${length.toString()} / 3,000`;

        if (length > 3000) {
            $charCounter.classList.add('exceed');
            $contentTextarea.value = $contentTextarea.value.slice(0, 3000);
        } else {
            $charCounter.classList.remove('exceed');
        }
    });
}


// 모달 관련 JS 함수 - 외부에 노출
function initCreateFeedModal() {
    bindEvents();
    setupNestedModalEvents();
}


export default initCreateFeedModal;