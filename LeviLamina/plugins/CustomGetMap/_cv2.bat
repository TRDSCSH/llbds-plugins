@echo off
echo =========================
echo ���ڵ�ǰĿ¼�½�python���⻷������װcv2�⡿
echo =========================
echo �½����⻷��: _cv2 ..
python -m venv _cv2
IF %errorlevel% NEQ 0 GOTO failed
IF %errorlevel% EQU 0 GOTO succeed
pause
:failed	
	echo �½����⻷��ʧ�ܣ�����python�Ƿ�װ��python��ӵ�����������
	goto End
:succeed
	echo =========================
	if not exist .\_cv2\Lib\site-packages\cv2 (
		echo ��װcv2��..
		"_cv2/Scripts/pip.exe" install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python
	) else (
		echo cv2���Ѱ�װ
	)
	echo =========================
	echo ��װ���, ����cutMap.py, ��֤�����Ƿ�װ�ɹ���
	echo =========================
	"./_cv2/Scripts/python.exe" cutMap.py
:End
pause