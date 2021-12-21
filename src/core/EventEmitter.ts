import * as fs from 'fs';
import * as Utils from './utils';

export class SimpleEventEmitter
{
	public add_log_par = '';
	public callbacks:{ [key: string]: Function[] } = {};
	public log_level = 'all';

	constructor()
	{
		this.add_log_par = '';
		this.callbacks = {};
		this.log_level = 'all';
		const is_server = !(typeof window != 'undefined' && window.document);

	}


	on(event:string, cb:Function)
	{
		if(!this.callbacks[event]) this.callbacks[event] = [];
		this.callbacks[event].push(cb)
	}

	off(event:string, cb:Function)
	{
		if(!this.callbacks[event])
			return;
		var ind = this.callbacks[event].indexOf(cb);
		if (ind > -1)
			this.callbacks[event].splice(ind, 1);
	}

	emit(..._args:any)
	{
		var args:string[] = [].slice.call(arguments);
		var event = args.shift();
		if (event === undefined)
			return;
		var cbs = this.callbacks[event];
		if(cbs)
			cbs.forEach(cb => cb.apply(this, args));
	}

	_log(type = 'log', args:any)
	{
		//this.emit('log-'+type, this, args);
		const is_server = !(typeof window != 'undefined' && window.document);
		if (is_server)
		{
			const date = Utils.getTime();
			args = [].slice.call(args);
			if (this.add_log_par != '')
				args.unshift(date + ' [' + this.add_log_par + ']: ');
			else
				args.unshift(date + ':');
		}
		if (this.log_level == 'all' || this.log_level == 'console')
		{
			if (is_server)
			{
				var largs = args.slice(0);
				if (type == 'log')
				{
					largs.unshift('\x1b[0m');
					largs.push('\x1b[0m');
				}
				if (type == 'info')
				{
					largs.unshift('\x1b[32m');
					largs.push('\x1b[0m');
				}
				if (type == 'warn')
				{
					largs.unshift('\x1b[33m');
					largs.push('\x1b[0m');
				}
				if (type == 'error')
				{
					largs.unshift('\x1b[31m');
					largs.push('\x1b[0m');
				}
			}
			else
				var largs = args; // [].slice.call(args);

			if (type == 'log')
				console.log.apply(console, largs);
			if (type == 'info')
				console.info.apply(console, largs);
			else if (type == 'warn')
				console.warn.apply(console, largs);
			else if (type == 'error')
				console.error.apply(console, largs);
		}
		if (is_server && (this.log_level == 'all' || this.log_level == 'file' || type == 'error'))
		{
			var s = '';
			for (var i = 0; i < args.length; i++)
				s += (typeof args[i] === 'object' ? JSON.stringify(args[i]) : args[i]) + ' ';
			var message = s.split("\n").join('-rn-') + "\r\n";
			if (!fs.existsSync('./logs/'))
				 fs.mkdirSync('./logs/');
			fs.appendFileSync('./logs/'+this.getLogName(type, this.add_log_par), message, 'utf-8');
			fs.appendFileSync('./logs/'+this.getLogName('all', this.add_log_par), type+'-'+message, 'utf-8');
		}
	}

	getLogName(type:string, ex = '', date = '')
	{
		if (date != '')
			var name = date+'_';
		else
			var name = Utils.getTime().split(" ")[0]+'_';
		if (ex != '')
			name = name + '['+ex+']_';
		name = name + type+'.txt';
		return name;
	}

	log(...args:any)
	{
		this._log('log', arguments);
	}

	info(...args:any)
	{
		this._log('info', arguments);
	}

	error(...args:any)
	{
		this._log('error', arguments);
	}

	warn(...args:any)
	{
		this._log('warn', arguments);
	}

}

