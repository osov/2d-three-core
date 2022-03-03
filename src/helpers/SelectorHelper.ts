import { Vector2, Object3D, Raycaster } from 'three';
import { BaseHelper } from './BaseHelper';
import { BaseEntity, EventBus, Input, MonoBehaviour } from 'ecs-threejs';
import { IEntityEventSubscribed } from 'ecs-threejs/src/systems/EventBus';
import { PointerEventData } from 'ecs-threejs/src/helpers/Input';



export class SelectorHelper extends BaseHelper {

	public selectedObject: Object3D | null = null;
	public isClickIntersect = false;
	public isMoveIntersect = false;

	private raycaster = new Raycaster();
	private list: MonoBehaviour[] = [];
	private monitoredEvents: {[id:number]:{ [k: string]: string[] }} = {};

	init() {
		EventBus.subscribeEvent<PointerEventData>('onPointerDown', this.onPointerDown.bind(this));
		EventBus.subscribeEvent<PointerEventData>('onPointerUp', this.onPointerUp.bind(this));
		EventBus.subscribeEvent<PointerEventData>('onPointerMove', this.onPointerMove.bind(this));
		EventBus.subscribeEvent<PointerEventData>('onPointerCancel', this.onPointerCancel.bind(this));
		EventBus.subscribeEvent<IEntityEventSubscribed>('entitySubscribeEvent', this.onEntitySubscribeEvent.bind(this))
	}

	onEntitySubscribeEvent(e: IEntityEventSubscribed) {
		if (['onPointerDown', 'onPointerUp'].includes(e.type)) {
			this.isClickIntersect = true;
			this.add(e.entity);
		}
		if (['onPointerMove'].includes(e.type)) {
			this.isClickIntersect = true;
			this.isMoveIntersect = true;
			this.add(e.entity);
		}
	}

	add(entity: MonoBehaviour) {
		if (this.list.includes(entity))
			return;
		this.list.push(entity);
	}

	clear() {
		this.list = [];
	}

	protected onPointerDown(e: PointerEventData) {
		if (this.isClickIntersect)
			this.checkOnIntersect('onPointerDown', e);
	}

	private onPointerMove(e: PointerEventData) {
		this.dispathMonitoredEvents('onDrag', e);
	}

	protected onPointerUp(e: PointerEventData) {
		this.dispathMonitoredEvents('onPointerUp', e);
		this.monitoredEvents = {};
	}

	protected onPointerCancel(e: PointerEventData) {
		this.onPointerUp(e);
	}

	private addMonitoredEvents(event: string, entity: BaseEntity, e:PointerEventData) {
		if (!this.monitoredEvents[e.pointerId])
			this.monitoredEvents[e.pointerId] = {};
		if (!this.monitoredEvents[e.pointerId][event])
		this.monitoredEvents[e.pointerId][event] = [];
		let eventName = EventBus.getEntityPrefixEvent(event, entity);
		this.monitoredEvents[e.pointerId][event].push(eventName);
	}

	private dispathMonitoredEvents(event: string, e:PointerEventData) {
		if (!this.monitoredEvents[e.pointerId] || !this.monitoredEvents[e.pointerId][event])
			return;
		let list = this.monitoredEvents[e.pointerId][event];
		for (let i = 0; i < list.length; i++) {
			const it = list[i];
			EventBus.dispatchEvent(it, e);
		}
	}

	private checkOnIntersect(typeEvent: string, e: PointerEventData) {

		var pointer = new Vector2(
			(Input.mousePosition.x / this.gs.container.clientWidth) * 2 - 1,
			(Input.mousePosition.y / this.gs.container.clientHeight) * 2 - 1
		);
		this.raycaster.setFromCamera(pointer, this.gs.cameraOrtho);
		const intersects = this.raycaster.intersectObjects(this.list, false);
		if (intersects.length > 0) {
			const res = intersects.filter(function (res) { return res && res.object && res.object instanceof BaseEntity; })[0];
			if (res && res.object) {
				let entity = res.object as BaseEntity;
				let isMonitor = EventBus.dispatchEventEntity<PointerEventData>(typeEvent, entity, e);
				if (isMonitor && typeEvent == 'onPointerDown'){

					this.addMonitoredEvents('onDrag', entity, e);
					this.addMonitoredEvents('onPointerUp', entity, e);
				}


				if (this.selectedObject == res.object)
					return;

				if (this.selectedObject)
					this.onLeaveItem(this.selectedObject);
				this.selectedObject = res.object;
				this.onEnterItem(this.selectedObject);
			}
		}
		else if (this.selectedObject) {
			this.onLeaveItem(this.selectedObject);
			this.selectedObject = null;
		}
	}

	private onEnterItem(mesh: Object3D) {
		//this.log('enter', mesh);
		//this.gs.dispatchEvent({ type: "onEnter", mesh: mesh });
	}

	private onLeaveItem(mesh: Object3D) {
		//this.log('leave', mesh);
		//this.gs.dispatchEvent({ type: "onLeave", mesh: mesh });
	}


}
