package com.lovychat.gecckocreator;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;

@CapacitorPlugin(name = "NativeGoogleAuth")
public class NativeGoogleAuthPlugin extends Plugin {

    @PluginMethod
    public void pickGoogleAccount(PluginCall call) {
        try {
            Account selectedAccount = null;
            ArrayList<Account> allowableAccounts = null;
            String[] allowableAccountTypes = new String[]{"com.google"};
            Bundle addAccountOptions = null;

            Intent intent = AccountManager.newChooseAccountIntent(
                selectedAccount,
                allowableAccounts,
                allowableAccountTypes,
                false,
                null,
                null,
                null,
                addAccountOptions
            );
            startActivityForResult(call, intent, "accountPickerResult");
        } catch (Exception e) {
            call.reject("Gagal membuka dialog akun Google perangkat: " + e.getMessage(), e);
        }
    }

    @ActivityCallback
    private void accountPickerResult(PluginCall call, ActivityResult result) {
        if (result == null) {
            call.reject("Pemilihan akun Google dibatalkan.");
            return;
        }

        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            String accountName = result.getData().getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
            if (accountName != null && !accountName.trim().isEmpty()) {
                JSObject ret = new JSObject();
                ret.put("email", accountName.trim());
                call.resolve(ret);
                return;
            }
        }

        call.reject("Pemilihan akun Google dibatalkan.");
    }
}
