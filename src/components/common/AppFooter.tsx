import {Button, Separator} from '../ui';

function AppFooter() {
  return (
    <footer className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-[1328px] flex flex-col p-6 pb-18 gap-6">
        <div className="w-full flex items-start justify-between flex-col md:flex-row gap-6 md:gap-0">
          <div className="w-full flex items-start justify-between gap-4 md:w-fit flex-col">
            <div className="flex flex-col items-start">
              <h3 className="scroll-m-20 md:text-2xl font-semibold tracking-tight text-base">나의 학습 여정이,</h3>
              <h3 className="scroll-m-20 md:text-2xl font-semibold tracking-tight text-base">
                나만의 창작으로 이어지는 플랫폼
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={'outline'} size={'icon'} className="border-0">
                <img src="/assets/icons/company/youtube.svg" alt="@SNS" className="w-6 h-6 mt-0.5" />
              </Button>
              <Button variant={'outline'} size={'icon'} className="border-0">
                <img src="/assets/icons/company/threads.svg" alt="@SNS" className="w-[22px] h-[22px]" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="cursor-pointer transition-all duration-500 hover:font-medium">이용약관</p>
            <Separator orientation="vertical" className="h-3.5!" />
            <p className="cursor-pointer transition-all duration-500 hover:font-medium">개인정보처리방침</p>
            <Separator orientation="vertical" className="h-3.5!" />
            <p className="cursor-pointer transition-all duration-500 hover:font-medium">클래스 론칭 문의</p>
          </div>
        </div>
        <Separator />
        <div className="w-full flex items-start justify-between h-full flex-col md:flex-row gap-12 md:gap-0">
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col">
              <p className="h-10 text-base font-semibold">고객센터</p>
              <div className="flex flex-col items-start gap-1">
                <p>평일 오전 9시 ~ 오후 6시</p>
                <p>문의 : mingoteam@gmail.com</p>
              </div>
            </div>
            <p>@ Mingo Team all right reserved</p>
          </div>
          <div className="flex flex-col mr-[66px]">
            <p className="h-10 text-base font-semibold">사업자 정보</p>
            <div className="flex flex-col items-start gap-1">
              <p>대표이사 : 개발자 9Diin</p>
              <p>사업자 번호 : 012-34-56789</p>
              <p>통신판매신고번호 : 2025-대한민국-0123</p>
              <p>주소 : 서울특별시 강남구 강남대로 12길 34</p>
              <p>대표번호 : 012-3456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export {AppFooter};
