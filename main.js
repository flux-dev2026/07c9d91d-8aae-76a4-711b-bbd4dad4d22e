"ui";
{
    importClass('android.net.VpnService');
    const myPackageName = context.getPackageName();
    const storage = storages.create(myPackageName);
    const packagePath = files.getSdcardPath() + '/' + context.getPackageName() + '/';
    files.ensureDir(packagePath);
    http.__okhttp__.setTimeout(10000);
    ui.layout(
        `<vertical>
            <appbar>
                <toolbar id="toolbar" title="V${app.versionName}">
                    <button id="setting" layout_gravity="right" textSize="14sp" text="setting" color="#ffffff" bg="#00000000" />
                </toolbar>
            </appbar>
            <horizontal gravity="center" ayout_weight="1">
                <progressbar marginTop="10dp" indeterminateTint="#ff0000" />
            </horizontal>
        </vertical>`
    );
    activity.setSupportActionBar(ui.toolbar);
    ui.setting.on('click', () => {
        let txt = storage.get('upfatefile', '')
        dialogs.rawInput("", txt, (upfatefile) => {
            try {
                if (upfatefile) {
                    storage.put('upfatefile', upfatefile)
                    floaty.closeAll()
                    engines.stopAll();
                    let intent = context.getPackageManager()
                        .getLaunchIntentForPackage(myPackageName);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    activity.startActivity(intent);
                }
            } catch (ex) {

            }
        });
    })
    function loadUI() {
        try {
            let code = storage.get('code', '')
            {
                eval(code);
            }
        } catch (ex) {
            console.error($debug.getStackTrace(ex));
        }
    }
    function RemoteLoad() {
        try {
            let url;
            if (storage.contains('upfatefile')) {
                url = storage.get('upfatefile')
            }
            if (url) {
                http.get(url, {
                    timeout: 10000
                }, (res, err) => {
                    if (err) {
                       console.error($debug.getStackTrace(err));
                    }
                    else if (res.statusCode == 200) {
                        const code = res.body.string()
                        storage.put('code', code)
                        ui.post(() => {
                            loadUI()
                        })
                    } else {

                    }
                });
            }
        } catch (ex) {
            console.error($debug.getStackTrace(ex));
        }
    }
    const intent = VpnService.prepare(activity);
    if (intent == null) {
        RemoteLoad()
    } else {
        function activity_result(requestCode, resultCode, data) {
            if (requestCode === 0) {
                if (resultCode === activity.RESULT_OK) {
                    RemoteLoad()
                    ui.emitter.removeListener("activity_result", activity_result);
                } else {
                    activity.startActivityForResult(intent, 0)
                }
            }
        }
        ui.emitter.on("activity_result", activity_result);
        activity.startActivityForResult(intent, 0)
    }
}
