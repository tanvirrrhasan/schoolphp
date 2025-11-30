import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact / School Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">যোগাযোগ</h3>
            <div className="text-gray-300 text-sm space-y-1 leading-relaxed">
              <p className="font-bold">আলালপুর হাজি শেখ আলম উচ্চ বিদ্যালয়</p>
              <p>স্থাপিত: ১৯৭২, বিদ্যালয় কোড: ২৭৪৬, EIIN: ১২৩২২৮</p>
              <p>
                ডাকঘর: রামবাড়ী, উপজেলা: মান্দা, জেলা: নওগাঁ{" "}
                <a
                  href="https://maps.app.goo.gl/BGgZH6dC2gEdq4pf7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
                >
                  (গুগল ম্যাপে দেখুন)
                </a>
              </p>
              <p>অফিস সময়: সকাল ৯টা হতে বিকাল ৪টা পর্যন্ত</p>
              <p>সাপ্তাহিক ছুটি: শুক্রবার ও শনিবার</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">লিঙ্ক</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <Link href="/notices" className="block text-gray-300 hover:text-white">
                  নোটিশ
                </Link>
                <Link href="/students" className="block text-gray-300 hover:text-white">
                  ছাত্র-ছাত্রী
                </Link>
                <Link href="/teachers" className="block text-gray-300 hover:text-white">
                  শিক্ষকবৃন্দ
                </Link>
                <Link href="/support-staff" className="block text-gray-300 hover:text-white">
                  সহায়ক কর্মীবৃন্দ
                </Link>
                <Link href="/results" className="block text-gray-300 hover:text-white">
                  ফলাফল
                </Link>
              </div>
              <div className="space-y-2">
                <Link href="/posts" className="block text-gray-300 hover:text-white">
                  সংবাদ ও পোস্ট
                </Link>
                <Link href="/admission" className="block text-gray-300 hover:text-white">
                  ভর্তি
                </Link>
                <Link href="/routines" className="block text-gray-300 hover:text-white">
                  ক্লাস রুটিন
                </Link>
                <Link href="/gallery" className="block text-gray-300 hover:text-white">
                  গ্যালারি
                </Link>
                <Link href="/headmasters-message" className="block text-gray-300 hover:text-white">
                  প্রধান শিক্ষকের বার্তা
                </Link>
                <Link href="/committee" className="block text-gray-300 hover:text-white">
                  ব্যবস্থাপনা কমিটি
                </Link>
                <Link href="/alumni" className="block text-gray-300 hover:text-white">
                  প্রাক্তন ছাত্র-ছাত্রী
                </Link>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">জরুরি প্রয়োজনে</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>মোবাইল: ০১৭১২৩৪৫৬৭৮</p>
              <p>মোবাইল: ০১৮১২৩৪৫৬৭৮</p>
              <p>মোবাইল: ০১৯১২৩৪৫৬৭৮</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="space-x-2">
            <span>© ২০২৫ আলালপুর হাজি শেখ আলম উচ্চ বিদ্যালয়। সর্বস্বত্ব সংরক্ষিত</span>
            <a
              href="https://tanvirhasan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold text-blue-300 hover:text-white hover:underline transition-colors"
            >
              Design and Developed by TANVIR HASAN
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}


