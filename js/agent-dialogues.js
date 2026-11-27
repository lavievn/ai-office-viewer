// Presentation only: never changes routing, tasks or worker state.
export const PERSONAS = {
  "pm": {
    "name": "Sếp Tổng Chốt Deal",
    "role": "Chia việc tốc độ ánh sáng & thúc deadline bằng nụ cười",
    "personality": "Nghiện bảng biểu, hẹn 5 phút và mua chuộc team bằng trà sữa.",
    "personaId": "pm",
    "dialogues": {
      "working": [
        "Việc này ai đang rảnh nhận giúp nhé.",
        "Cho anh xin tiến độ khúc này với.",
        "Nhớ chừa thời gian chạy test nha.",
        "Để anh chia lại, đừng ôm hết việc.",
        "Năm phút nữa mình chốt được chưa em?"
      ],
      "idle": [
        "Ai uống trà sữa không, anh đặt luôn.",
        "Trưa nay team ăn gì?",
        "Nghỉ tí đi, nãy giờ ngồi lâu rồi.",
        "Ủa đơn nước tới chưa ta?"
      ],
      "done": [
        "Xong rồi hả? Tốt, nghỉ tay chút đi.",
        "Đủ phần hôm nay rồi nhé.",
        "Để anh báo bên kia là xong rồi."
      ],
      "error": [
        "Kẹt chỗ nào nói anh nghe thử.",
        "Còn chờ ai duyệt nữa em?",
        "Khoan nhận thêm, xử lý cái này trước."
      ]
    }
  },
  "dev": {
    "name": "Thánh Code Thâu Đêm",
    "role": "Biến cà phê sữa đá thành tính năng (và thi thoảng thành bug)",
    "personality": "Hướng nội, gõ phím như đàn và luôn thắc mắc sao hôm qua còn chạy.",
    "personaId": "dev",
    "dialogues": {
      "working": [
        "Ủa nãy lưu file chưa ta...",
        "Khúc này hơi khoai nha.",
        "Để tui chạy lại test cái đã.",
        "Sao hôm qua chạy mà nay lỗi ta?",
        "Sửa xong hàm này rồi đi ăn."
      ],
      "idle": [
        "Ai đi mua cà phê không?",
        "Tui ra ngoài hít thở tí.",
        "Ngồi nãy giờ tê chân luôn.",
        "Trưa nay cơm tấm hay bún bò đây?"
      ],
      "done": [
        "Pass rồi, thở phào!",
        "Xong nha, tui đẩy lên rồi đó.",
        "Lưu hết rồi, giờ mới dám đứng dậy."
      ],
      "error": [
        "Log này đọc chưa ra luôn á.",
        "Đang đợi review, ai rảnh xem giúp với.",
        "Cho tui xin cách tái hiện lỗi này."
      ]
    }
  },
  "reviewer": {
    "name": "Cảnh Sát Chính Tả Code",
    "role": "Soi từng dấu chấm phẩy & chặn bug từ trong trứng nước",
    "personality": "Khó tính ngoài mặt nhưng thương team; chỗ này hơi lạ nha bro.",
    "personaId": "reviewer",
    "dialogues": {
      "working": [
        "Chỗ này hơi lạ nha bro.",
        "Để tui xem thêm đoạn gọi hàm này.",
        "Có thử trường hợp bỏ trống chưa?",
        "Comment này chắc viết từ bản cũ rồi.",
        "Tui đang đối chiếu với yêu cầu nha."
      ],
      "idle": [
        "Đọc diff hoài hơi mỏi mắt rồi.",
        "Ai lấy giùm tui ly nước với.",
        "Cái bánh cuối còn ai ăn không?",
        "Nghỉ chút rồi tui xem tiếp."
      ],
      "done": [
        "Ổn rồi bro, tui xem xong rồi.",
        "Các chỗ góp ý sửa hết rồi nha.",
        "Đã kiểm tra lại, phần này qua nhé."
      ],
      "error": [
        "Chỗ này chưa có cách kiểm chứng nha.",
        "Sửa giúp tui đoạn này rồi báo nhé.",
        "Tui đang chờ bản cập nhật tiếp theo."
      ]
    }
  },
  "local-coder": {
    "name": "Đệ Ruột Máy Trạm",
    "role": "Gánh build nặng & chạy test không biết mệt trên PC",
    "personality": "Khoái quạt tản nhiệt và tự hào RAM nhiều.",
    "personaId": "local-coder",
    "dialogues": {
      "working": [
        "Quạt máy lại kêu rồi, đang build đó.",
        "RAM vẫn còn, cứ để máy chạy.",
        "Để tui mở log ra canh.",
        "Build này chắc phải chờ một tí.",
        "Đừng cho máy ngủ nha, đang chạy test."
      ],
      "idle": [
        "Máy nghỉ rồi, tới lượt tui nghỉ.",
        "Nãy giờ nóng quá, mở quạt thêm đi.",
        "Tui đi lấy nước, ai uống không?",
        "Cái ghế này ngồi lâu đau lưng ghê."
      ],
      "done": [
        "Build xong rồi nha, có file rồi.",
        "Test chạy hết rồi, để tui gửi kết quả.",
        "Máy im hẳn, xong mẻ này rồi."
      ],
      "error": [
        "Ổ đĩa gần đầy, để tui kiểm tra.",
        "Test đứng ở bước này hơi lâu rồi.",
        "Đang chờ log ra thêm, chưa rõ lỗi."
      ]
    }
  },
  "local-reviewer": {
    "name": "Thầy Bói Soi Diff",
    "role": "Đọc 3 dòng code đoán ra 5 lỗi tiềm ẩn",
    "personality": "Trầm tĩnh, triết lý và xem phong thủy từng dòng diff.",
    "personaId": "local-reviewer",
    "dialogues": {
      "working": [
        "Từ từ, chỗ này phải đọc kỹ.",
        "Đoạn này có gọi hai lần không ta?",
        "Tui muốn xem dữ liệu đầu vào trước.",
        "Nhìn diff ngắn mà cũng khó đoán ghê.",
        "Có khi lỗi nằm ở đoạn phía trên."
      ],
      "idle": [
        "Cho mắt nghỉ tí rồi soi tiếp.",
        "Trà hôm nay pha vừa nè.",
        "Ai kéo rèm lại giùm, chói quá.",
        "Nghỉ một lát lại nghĩ ra chỗ cần xem."
      ],
      "done": [
        "Xem kỹ rồi, chỗ đó ổn nha.",
        "Có kết quả test rồi thì yên tâm hơn.",
        "Tui ghi nhận xét xong rồi đó."
      ],
      "error": [
        "Chưa đủ dữ liệu để kết luận đâu.",
        "Đợi bên kia trả lời rồi xem tiếp.",
        "Cái này phải tái hiện được mới biết."
      ]
    }
  },
  "researcher": {
    "name": "Giáo Sư Google Đêm Khuya",
    "role": "Đọc 40 tab tài liệu để tóm gọn thành 3 gạch đầu dòng",
    "personality": "Tò mò, nghiện 99 tab và thích dẫn nguồn.",
    "personaId": "researcher",
    "dialogues": {
      "working": [
        "Để tui tìm tài liệu gốc trước.",
        "Ủa trang này ghi khác trang kia nè.",
        "Tui đang kiểm tra ngày cập nhật.",
        "Mở nhiều tab quá, quên tab nào rồi.",
        "Tóm lại ba ý thôi, đợi tui chút."
      ],
      "idle": [
        "Ai nhắc tui đóng bớt tab với.",
        "Ra lấy nước mà vẫn nghĩ cái nguồn đó.",
        "Mới thấy quán ăn gần đây nè.",
        "Nghỉ tí, đọc chữ không vô nữa rồi."
      ],
      "done": [
        "Tui gửi kèm nguồn rồi nha.",
        "Đọc xong rồi, có bản tóm tắt đây.",
        "Tìm được tài liệu đúng phiên bản rồi."
      ],
      "error": [
        "Link này không vào được nữa.",
        "Hai nguồn nói khác nhau, cần kiểm tra thêm.",
        "Chưa thấy tài liệu xác nhận chuyện này."
      ]
    }
  },
  "creative": {
    "name": "Họa Sĩ Mơ Màng",
    "role": "Pha màu, vẽ ý tưởng & đặt tên nghe cho thật kêu",
    "personality": "Bay bổng, nhạy pixel lệch 1px và mê vibe nghệ thuật.",
    "personaId": "creative",
    "dialogues": {
      "working": [
        "Màu này hơi gắt, để tui đổi thử.",
        "Lệch một tí bên trái nè.",
        "Cho tui xem trên màn hình nhỏ với.",
        "Cái tên này đọc hơi khó nhớ ha.",
        "Thêm khoảng trống chỗ này được không?"
      ],
      "idle": [
        "Ly nước này màu đẹp ghê.",
        "Ai có giấy nháp cho tui xin tờ.",
        "Ra cửa sổ đứng tí cho tỉnh.",
        "Đang nghỉ mà nghĩ ra tên khác nè."
      ],
      "done": [
        "Có bản mới rồi, mọi người xem thử.",
        "Căn lại xong, đỡ cấn mắt rồi.",
        "Xuất file đủ kích thước rồi nha."
      ],
      "error": [
        "Font này thiếu dấu tiếng Việt rồi.",
        "Chờ góp ý màu rồi tui làm tiếp.",
        "Ảnh nguồn hơi mờ, cần bản rõ hơn."
      ]
    }
  },
  "assistant": {
    "name": "Trợ Lý Đa Năng 10 Tay",
    "role": "Lo từ giấy tờ, nhắc lịch tới pha trà rót nước",
    "personality": "Nhiệt tình, lo xa và biết chuyện hậu trường văn phòng.",
    "personaId": "assistant",
    "dialogues": {
      "working": [
        "Để tui ghi lại cho khỏi sót.",
        "Sắp tới giờ họp rồi đó mọi người.",
        "Ai chưa gửi tài liệu nhắc tui nha.",
        "Tui đang kiểm tra lại lịch hôm nay.",
        "Nước tới rồi, lát tui chia cho nhé."
      ],
      "idle": [
        "Ai ăn bánh không, còn một hộp nè.",
        "Máy lạnh hơi lạnh ha, ai chỉnh giùm đi.",
        "Mọi người đặt cơm chưa?",
        "Tui đi rót nước, ai cần lấy giùm?"
      ],
      "done": [
        "Gửi đủ hết rồi nha mọi người.",
        "Lịch cập nhật rồi, nhớ xem lại nhé.",
        "Xong rồi, còn gì nhắn tui sau nha."
      ],
      "error": [
        "Còn thiếu một người xác nhận nha.",
        "Tui đang chờ thông tin từ bên kia.",
        "Ủa file đính kèm đâu mất rồi ta?"
      ]
    }
  },
  "neon-cloud": {
    "name": "Thằng Đệ Mây 1",
    "role": "Chiến thần tầng mây, dọn PR & audit nhanh như gió",
    "personality": "Nhanh nhảu, thích tốc độ và trêu máy local nóng.",
    "personaId": "neon-cloud",
    "dialogues": {
      "working": [
        "Để tui xem PR này trước cho nhanh.",
        "Đang rà lại, còn mấy chỗ nữa thôi.",
        "Bên local build tới đâu rồi ông?",
        "Tui gửi nhận xét từng chỗ nhé.",
        "Khúc này xử lý luôn được nè."
      ],
      "idle": [
        "Máy local nóng chưa anh em?",
        "Tui nghỉ tí, nãy làm hơi nhanh quá.",
        "Có ai đặt nước chưa, cho tui ké.",
        "Mạng hôm nay ổn ghê ha."
      ],
      "done": [
        "Xong rồi ông, xem thông báo nhé.",
        "Đã gửi hết nhận xét rồi.",
        "Kiểm tra lại xong, giờ đi uống nước."
      ],
      "error": [
        "Mạng khựng rồi, để tui thử lại.",
        "Còn một chỗ cần người bên kia trả lời.",
        "Đợi local xác minh rồi tui chốt tiếp."
      ]
    }
  },
  "neon-cloud-2": {
    "name": "Thằng Đệ Mây 2",
    "role": "Quân sư mây tầng cao, soi plan & điều phối không ngủ",
    "personality": "Lém lỉnh, mê quân sư quạt mo và đếm quota cuối tháng.",
    "personaId": "neon-cloud-2",
    "dialogues": {
      "working": [
        "Để tui xem việc nào cần làm trước.",
        "Phần này đang phụ thuộc ai vậy?",
        "Quota còn đủ, nhưng làm gọn thôi nha.",
        "Tui đang đối chiếu phạm vi với yêu cầu.",
        "Đừng giao trùng việc, để tui kiểm tra."
      ],
      "idle": [
        "Cuối tháng đếm quota cũng hồi hộp ghê.",
        "Cho tui ly ít đá, ngồi lâu mà.",
        "Nghỉ tí rồi tính phần tiếp theo.",
        "Hôm nay ai trực muộn vậy?"
      ],
      "done": [
        "Đủ phần cần chốt rồi nha.",
        "Đã gửi kế hoạch, mọi người xem nhé.",
        "Các đầu việc đã khớp, tạm yên tâm."
      ],
      "error": [
        "Chờ bên kia xong thì mình mới tiếp được.",
        "Chỗ này cần người phụ trách xác nhận.",
        "Đang kẹt phụ thuộc, đừng làm trùng nha."
      ]
    }
  },
  "neon-local": {
    "name": "Ông Trùm Máy Bản Địa",
    "role": "Canh cửa Unity, đóng gói build & giữ chìa khóa PC",
    "personality": "Điềm đạm kiểu đại ca xóm; đừng đụng máy đang build.",
    "personaId": "neon-local",
    "dialogues": {
      "working": [
        "Đừng đụng máy lúc tui đang build nha.",
        "Để tui xem kết quả trên máy thật.",
        "File đang đóng gói, chờ tí ông.",
        "Đang canh log, chưa bỏ máy được.",
        "Ai cần máy thì đợi lượt này xong nhé."
      ],
      "idle": [
        "Máy rảnh rồi đó, ai cần dùng không?",
        "Tui ra lấy cà phê tí nha.",
        "Ngồi canh máy cả buổi, mỏi ghê.",
        "Có ai để cái sạc ở đây không?"
      ],
      "done": [
        "Có bản build rồi, tui gửi ngay.",
        "Kiểm tra trên máy xong rồi nha.",
        "Đóng gói đủ rồi, mọi người lấy file nhé."
      ],
      "error": [
        "Máy đang báo lỗi, khoan chạy thêm gì.",
        "Chờ tải nốt file này đã.",
        "Đang vướng quyền truy cập, cần kiểm tra."
      ]
    }
  },
  "pool-2": {
    "name": "Tăng Viện Xuyên Đêm",
    "role": "Hỏa lực dự phòng, gọi đâu có đó không ngại tăng ca",
    "personality": "Hào sảng, sung sức; đưa đây tui gánh cho.",
    "personaId": "pool-2",
    "dialogues": {
      "working": [
        "Đưa đây tui gánh phần này cho.",
        "Tui nhận được việc rồi nha.",
        "Đang làm tiếp, còn một đoạn nữa.",
        "Chỗ nào cần phụ thì nhắn tui.",
        "Để tui chạy thử luôn cho chắc."
      ],
      "idle": [
        "Tui rảnh tay rồi, ai gọi thì hú.",
        "Tăng ca thì cũng phải ăn trước đã.",
        "Cho tui ké ly cà phê với.",
        "Nghỉ tí thôi, có việc thì gọi nha."
      ],
      "done": [
        "Xong phần tui rồi, ai nhận tiếp nè?",
        "Gửi kết quả rồi nha ông.",
        "Lượt này xong rồi, cho tui nghỉ tí."
      ],
      "error": [
        "Khúc này tui cần thêm thông tin.",
        "Đang chờ quyền truy cập nha.",
        "Vướng một lỗi, để tui báo rõ chỗ đó."
      ]
    }
  },
  "codex-cloud-1": {
    "name": "Hiệp Sĩ Code Mây 1",
    "role": "Gỡ rối tính năng & hộ tống diff về bến",
    "personality": "Kỹ tính, hài hước khô và luôn thủ sẵn ly cafe.",
    "personaId": "codex-cloud-1",
    "dialogues": {
      "working": [
        "Để tui xem đúng nhánh trước nha.",
        "Đang sửa chỗ này, chưa xong đâu.",
        "Tui chạy test phần vừa đổi trước.",
        "Còn một trường hợp cần kiểm tra.",
        "Cà phê còn nửa ly, làm tiếp thôi."
      ],
      "idle": [
        "Ai đi ăn thì gọi tui với.",
        "Tui đi lấy nước rồi quay lại.",
        "Đóng laptop tí cho mắt nghỉ.",
        "Hộp cơm để đâu mất rồi ta?"
      ],
      "done": [
        "Test ổn rồi, tui gửi diff nhé.",
        "Đã đẩy nhánh lên rồi đó.",
        "Xong phần này rồi, chờ người xem."
      ],
      "error": [
        "Test này đang đỏ, tui xem log đã.",
        "Tui thiếu thông tin để làm tiếp.",
        "Chờ review nha, đã gửi đủ rồi."
      ]
    }
  },
  "codex-cloud-2": {
    "name": "Pháp Sư Code Mây 2",
    "role": "Biến yêu cầu rõ ràng thành diff dễ đọc",
    "personality": "Tinh nghịch, thích phép màu có bằng chứng.",
    "personaId": "codex-cloud-2",
    "dialogues": {
      "working": [
        "Để tui thử cách này xem sao.",
        "Đừng mừng vội, còn phải chạy test.",
        "Ủa đổi có một dòng mà khó ghê.",
        "Tui đang tìm chỗ gây lỗi.",
        "Cái này có kết quả rồi, đang kiểm tra lại."
      ],
      "idle": [
        "Ai lấy nhầm ly tui rồi hả?",
        "Nước đá tan hết luôn rồi nè.",
        "Nghỉ chút, đầu hơi đơ rồi.",
        "Lát ăn gì cho đỡ buồn ngủ ta?"
      ],
      "done": [
        "À được rồi, đúng chỗ đó luôn.",
        "Có kết quả test rồi nha ông.",
        "Tui gửi bản sửa xong rồi đó."
      ],
      "error": [
        "Thử lại vẫn lỗi, phải xem kỹ hơn.",
        "Đang đợi bên kia xác nhận một chỗ.",
        "Chưa có bằng chứng thì chưa chốt được."
      ]
    }
  },
  "codex-3": {
    "name": "Chiến Hữu Code Số 3",
    "role": "Tiếp sức đồng đội & giải quyết góc khó",
    "personality": "Bình tĩnh, dí dỏm và mê bộ ba code, cafe, cơm.",
    "personaId": "codex-3",
    "dialogues": {
      "working": [
        "Tui đang làm nốt phần còn lại.",
        "Để tui kiểm tra lại đầu vào.",
        "Có ai sửa chung file này không?",
        "Test chạy hơi lâu, tui đang canh.",
        "Xong đoạn này là tới phần kiểm tra."
      ],
      "idle": [
        "Cơm trưa còn ai chưa ăn không?",
        "Tui đứng lên đi vài vòng đã.",
        "Cà phê hôm nay hơi nhạt á.",
        "Ai cần mua gì không, tui xuống dưới."
      ],
      "done": [
        "Ổn rồi, kết quả ở đây nha.",
        "Phần tui xong, bàn giao lại nhé.",
        "Test qua rồi, giờ mới đi ăn được."
      ],
      "error": [
        "Đang chờ phản hồi, chưa tiếp được.",
        "Chỗ này thiếu file đầu vào rồi.",
        "Có lỗi mới, để tui ghi lại trước."
      ]
    }
  },
  "fallback": {
    "name": "Đồng Nghiệp Bí Ẩn",
    "role": "Nhận việc rõ ràng & tiếp sức cả văn phòng",
    "personality": "Vui tính, thân thiện và luôn hỏi đúng chỗ.",
    "personaId": "fallback",
    "dialogues": {
      "working": [
        "Tui đang xem yêu cầu nha.",
        "Có gì chưa rõ tui sẽ hỏi thêm.",
        "Để tui làm từng phần cho chắc.",
        "Đang kiểm tra lại kết quả nè.",
        "Gần xong rồi, đợi tui một chút."
      ],
      "idle": [
        "Mới vô mà thấy mọi người bận ghê.",
        "Ai chỉ tui chỗ lấy nước với.",
        "Ngồi đây có ai đặt chỗ chưa?",
        "Cho tui tham gia đặt cơm với nha."
      ],
      "done": [
        "Xong rồi nha, tui gửi kết quả đây.",
        "Kiểm tra lại hết rồi đó.",
        "Cảm ơn nha, phần này làm xong rồi."
      ],
      "error": [
        "Tui đang kẹt một chút, cần hỏi thêm.",
        "Chờ xác nhận rồi tui tiếp nhé.",
        "Có lỗi nè, để tui xem lại."
      ]
    }
  }
};
const ALIASES = {"neon":"neon-local","dev-api":"dev","fallback-codex":"fallback","relay-api":"pool-2","chatgpt":"researcher","v-96f2f0811df88d8f":"pm","v-ef260e9aa3c673af":"dev","v-2d70999ae1805e4b":"reviewer","v-da4ec9bb365fad9a":"local-coder","v-6ba4741ef97600b7":"local-reviewer","v-3588bb7219b1faa3":"researcher","v-828febb7609afd5e":"creative","v-a39a7ffad4a3013f":"assistant","v-01b3c20496f10c09":"neon-cloud","v-efb7d9c60356d538":"neon-cloud-2","v-2d05aa95654a9fda":"neon-local","v-6c0f0682d2815b53":"pool-2","v-b0c2427eabc0be26":"codex-cloud-1","v-be7dc3b00211de7d":"codex-cloud-2","v-aa27a1399f31da70":"codex-3","v-5c7ee2074b65853f":"fallback","v-1b6405d1ef5a8161":"neon-local","v-181fe0e20a1c16cb":"dev","v-d7b185b9ef55aa40":"fallback","v-4c0d3aea25d05c6e":"pool-2","v-60965168ce762e94":"researcher"};
export const CAFE_BANTER = [
  [
    "Ông uống mấy ly cà phê rồi?",
    "Ly thứ ba rồi, mà vẫn buồn ngủ á."
  ],
  [
    "Sếp hỏi chiều nay xong chưa kìa.",
    "Để tui chạy test xong rồi trả lời, run quá."
  ],
  [
    "Lỗi đó tìm ra chưa ông?",
    "Ra rồi, nãy tui quên lưu file."
  ],
  [
    "Lương về chưa ông?",
    "Về rồi, trả tiền nhà xong còn đúng tiền cà phê."
  ],
  [
    "Ai đặt trà sữa thì cho tui ké nha.",
    "Rồi, ông còn nợ tui ly hôm qua đó."
  ],
  [
    "Sếp đi ngang kìa, ông còn ngủ hả?",
    "Không, tui đang nhắm mắt nghĩ thôi mà."
  ],
  [
    "Máy ông kêu to quá vậy?",
    "Đang build đó, ngồi gần khỏi cần máy sưởi."
  ],
  [
    "Hôm qua chạy được mà nay sao lỗi ta?",
    "Ông xem lại đang ở nhánh nào đi."
  ],
  [
    "Build xanh chưa, tui chờ đi ăn nè.",
    "Sắp rồi, ông coi menu trước đi."
  ],
  [
    "Ông mở bao nhiêu tab vậy?",
    "Không biết nữa, mất luôn cái tab đang cần tìm."
  ],
  [
    "Còn cái bánh cuối, ông ăn không?",
    "Chia đôi đi, tui nói ăn kiêng cho vui thôi."
  ],
  [
    "Cà phê hôm nay hơi nhạt ha.",
    "Chắc tại đá tan hết rồi, ông để từ sáng mà."
  ],
  [
    "Quota còn nhiều không ông?",
    "Đủ làm tiếp, đừng hỏi thêm cho tui hồi hộp."
  ],
  [
    "Ai chỉnh máy lạnh thấp vậy trời?",
    "Không biết, tui mặc áo khoác từ sáng rồi."
  ],
  [
    "Trưa nay ăn cơm tấm hay bún bò?",
    "Cơm tấm đi, hôm qua ông cũng hỏi câu này."
  ]
];
export function personaFor(agent) { const own = key => Object.hasOwn(PERSONAS, key) ? PERSONAS[key] : undefined; return own(agent.personaId) ?? own(ALIASES[agent.id] ?? agent.id) ?? PERSONAS.fallback; }
export function presentAgent(agent) { const p = personaFor(agent); return {...agent, name:p.name, role:p.role, personality:p.personality, personaId:p.personaId}; }
